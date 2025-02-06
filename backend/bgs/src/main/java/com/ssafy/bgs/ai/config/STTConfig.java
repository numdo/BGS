package com.ssafy.bgs.ai.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class STTConfig {

    @Value("${stt.api.key}")
    private String apiKey;

    @Value("${stt.api.url}")
    private String apiUrl;

    @Value("${stt.language}")
    private String language;

    public String getApiKey() {
        return apiKey;
    }

    public String getApiUrl() {
        return apiUrl;
    }

    public String getLanguage() {
        return language;
    }
}
