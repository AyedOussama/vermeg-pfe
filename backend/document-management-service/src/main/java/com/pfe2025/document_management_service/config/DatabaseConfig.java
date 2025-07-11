package com.pfe2025.document_management_service.config;


import com.pfe2025.document_management_service.model.Document;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.convert.WritingConverter;
import org.springframework.data.r2dbc.convert.R2dbcCustomConversions;
import org.springframework.data.r2dbc.dialect.PostgresDialect;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class DatabaseConfig {

    @Bean
    public R2dbcCustomConversions r2dbcCustomConversions() {
        List<Converter<?, ?>> converters = new ArrayList<>();
        converters.add(new DocumentTypeToStringConverter());
        converters.add(new StringToDocumentTypeConverter());
        return R2dbcCustomConversions.of(PostgresDialect.INSTANCE, converters);
    }

    @WritingConverter
    static class DocumentTypeToStringConverter implements Converter<Document.DocumentType, String> {
        @Override
        public String convert(Document.DocumentType source) {
            return source.name();
        }
    }

    @ReadingConverter
    static class StringToDocumentTypeConverter implements Converter<String, Document.DocumentType> {
        @Override
        public Document.DocumentType convert(String source) {
            try {
                return Document.DocumentType.valueOf(source.toUpperCase());
            } catch (IllegalArgumentException e) {
                return Document.DocumentType.OTHER;
            }
        }
    }
}