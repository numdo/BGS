package com.ssafy.bgs.user.config;

import com.ssafy.bgs.user.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        // 1. CORS 설정 추가
        http.cors(cors -> cors.configurationSource(request -> {
            CorsConfiguration config = new CorsConfiguration();
            config.setAllowedOrigins(List.of("http://localhost:5173", "http://i12c209.p.ssafy.io:5000", "https://i12c209.p.ssafy.io:5000")); // 클라이언트 도메인 추가
            config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
            config.setAllowedHeaders(List.of("Authorization", "Refresh-Token", "Content-Type"));
            config.setExposedHeaders(List.of("Authorization", "Refresh-Token")); // 노출할 헤더
            config.setAllowCredentials(true); // 쿠키 허용 여부
            return config;
        }));

        // 2. CSRF 비활성화 (REST API 형태)
        http.csrf(csrf -> csrf.disable());

        // 3. URL별 권한 설정
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/users/signup").permitAll()
                .requestMatchers("/api/users/email-verification/**").permitAll()
                .requestMatchers("/api/users/verify-code/**").permitAll()
                .requestMatchers("/api/users/reset-password/**").permitAll()
                .requestMatchers("/api/users/login").permitAll()
                .requestMatchers("/images/**").permitAll()
                .requestMatchers("/profile/**").permitAll()
                .anyRequest().authenticated()
        );

        // 4. 폼 로그인 비활성화 및 기본 HTTP Basic 인증 설정
        http.formLogin(form -> form.disable());
        http.httpBasic(Customizer.withDefaults());

        // 5. JWT 필터 추가 (보호 API에 대해 JWT 인증 진행)
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // BCryptPasswordEncoder 빈 등록 (JWT 및 로컬 로그인 시 필요)
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
