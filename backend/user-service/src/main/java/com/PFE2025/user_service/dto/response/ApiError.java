package com.PFE2025.user_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiError {
    private int status;
    private String message;
    private String path;
    private LocalDateTime timestamp;
    private String errorCode;
    private Map<String, Object> details;

    public static ApiError of(int status, String message, String path) {
        return ApiError.builder()
                .status(status)
                .message(message)
                .path(path)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static ApiError of(int status, String message, String path, String errorCode) {
        return ApiError.builder()
                .status(status)
                .message(message)
                .path(path)
                .timestamp(LocalDateTime.now())
                .errorCode(errorCode)
                .build();
    }
}