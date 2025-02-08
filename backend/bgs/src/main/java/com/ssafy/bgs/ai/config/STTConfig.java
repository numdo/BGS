package com.ssafy.bgs.ai.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
public class STTConfig {
    @Value("${stt.api.url}")
    private String apiUrl;

    @Value("${stt.language}")
    private String language;
}
