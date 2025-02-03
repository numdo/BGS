package com.ssafy.bgs.redis.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class JacksonConfig {

    @Bean
    @Primary  // 글로벌 Bean으로 사용됨
    public ObjectMapper globalObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        // Java 8 날짜/시간 지원
        mapper.registerModule(new JavaTimeModule());
        // 날짜를 타임스탬프 대신 ISO 형식으로 출력
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        // 여기서는 default typing을 활성화하지 않으므로 웹 요청 JSON 역직렬화 시 @class 정보가 필요 없음
        return mapper;
    }
}
