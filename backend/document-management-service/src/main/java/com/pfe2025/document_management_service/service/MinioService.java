package com.pfe2025.document_management_service.service;




import com.pfe2025.document_management_service.config.MinioConfig;
import com.pfe2025.document_management_service.exception.StorageException;
import io.minio.*;
import io.minio.errors.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.core.io.buffer.DefaultDataBufferFactory;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MinioService {

    private final MinioClient minioClient;
    private final MinioConfig minioConfig;

    @PostConstruct
    public void initBucket() {
        try {
            boolean exists = minioClient.bucketExists(
                    BucketExistsArgs.builder()
                            .bucket(minioConfig.getBucket())
                            .build()
            );

            if (!exists) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder()
                                .bucket(minioConfig.getBucket())
                                .build()
                );
                log.info("Bucket {} created successfully", minioConfig.getBucket());
            } else {
                log.info("Bucket {} already exists", minioConfig.getBucket());
            }
        } catch (Exception e) {
            log.error("Error initializing MinIO bucket: ", e);
            throw new StorageException("Failed to initialize storage", e);
        }
    }

    public Mono<String> uploadFile(FilePart file, String folder) {
        String fileName = generateFileName(folder, file.filename());

        return DataBufferUtils.join(file.content())
                .flatMap(dataBuffer -> {
                    byte[] bytes = new byte[dataBuffer.readableByteCount()];
                    dataBuffer.read(bytes);
                    DataBufferUtils.release(dataBuffer);

                    return Mono.fromCallable(() -> {
                        try {
                            minioClient.putObject(
                                    PutObjectArgs.builder()
                                            .bucket(minioConfig.getBucket())
                                            .object(fileName)
                                            .stream(new ByteArrayInputStream(bytes), bytes.length, -1)
                                            .contentType(file.headers().getContentType() != null ?
                                                    file.headers().getContentType().toString() :
                                                    "application/octet-stream")
                                            .build()
                            );
                            log.info("File uploaded successfully: {}", fileName);
                            return fileName;
                        } catch (Exception e) {
                            log.error("Failed to upload file: {}", fileName, e);
                            throw new StorageException("Failed to upload file", e);
                        }
                    }).subscribeOn(Schedulers.boundedElastic());
                })
                .onErrorMap(e -> !(e instanceof StorageException),
                        e -> new StorageException("Upload failed", e));
    }

    public Flux<DataBuffer> downloadFile(String filePath) {
        log.debug("Downloading file: {}", filePath);

        return Mono.fromCallable(() ->
                        minioClient.getObject(
                                GetObjectArgs.builder()
                                        .bucket(minioConfig.getBucket())
                                        .object(filePath)
                                        .build()
                        ))
                .subscribeOn(Schedulers.boundedElastic())
                .flatMapMany(inputStream ->
                        DataBufferUtils.readInputStream(
                                () -> inputStream,
                                DefaultDataBufferFactory.sharedInstance,
                                4096
                        )
                )
                .onErrorMap(e -> new StorageException("Download failed: " + filePath, e));
    }

    public Mono<Long> getFileSize(String filePath) {
        return Mono.fromCallable(() -> {
            try {
                StatObjectResponse stat = minioClient.statObject(
                        StatObjectArgs.builder()
                                .bucket(minioConfig.getBucket())
                                .object(filePath)
                                .build()
                );
                return stat.size();
            } catch (ErrorResponseException e) {
                if (e.errorResponse().code().equals("NoSuchKey")) {
                    throw new StorageException("File not found: " + filePath, e);
                }
                throw new StorageException("Failed to get file size", e);
            } catch (Exception e) {
                throw new StorageException("Failed to get file size", e);
            }
        }).subscribeOn(Schedulers.boundedElastic());
    }

    public Mono<Void> deleteFile(String filePath) {
        return Mono.fromRunnable(() -> {
            try {
                minioClient.removeObject(
                        RemoveObjectArgs.builder()
                                .bucket(minioConfig.getBucket())
                                .object(filePath)
                                .build()
                );
                log.info("File deleted successfully: {}", filePath);
            } catch (ErrorResponseException e) {
                if (!e.errorResponse().code().equals("NoSuchKey")) {
                    log.error("Error deleting file: {}", filePath, e);
                    throw new StorageException("Failed to delete file", e);
                }
                log.warn("File not found for deletion: {}", filePath);
            } catch (Exception e) {
                log.error("Error deleting file: {}", filePath, e);
                throw new StorageException("Failed to delete file", e);
            }
        }).subscribeOn(Schedulers.boundedElastic()).then();
    }

    private String generateFileName(String folder, String originalFileName) {
        String extension = "";
        int lastDot = originalFileName.lastIndexOf('.');
        if (lastDot > 0) {
            extension = originalFileName.substring(lastDot);
        }
        return String.format("%s/%s%s", folder, UUID.randomUUID(), extension);
    }
}
