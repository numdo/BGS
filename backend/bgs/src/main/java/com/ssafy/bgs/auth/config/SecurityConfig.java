package com.ssafy.bgs.auth.config;

import com.ssafy.bgs.auth.jwt.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
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
            config.setAllowedOrigins(List.of(
                    "http://localhost:5173",
                    "http://i12c209.p.ssafy.io",
                    "http://i12c209.p.ssafy.io:5000",
                    "https://i12c209.p.ssafy.io",
                    "https://i12c209.p.ssafy.io:5000"
            ));
            config.setAllowedMethods(List.of("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"));
            config.setAllowedHeaders(List.of("Authorization", "Refresh-Token", "Content-Type"));
            config.setExposedHeaders(List.of("Authorization", "Refresh-Token")); // 노출할 헤더
            config.setAllowCredentials(true); // 쿠키 허용 여부
            return config;
        }));

        // 2. CSRF 비활성화 (REST API 형태)
        http.csrf(csrf -> csrf.disable());

        // 3. URL별 권한 설정
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers(
                        "/**",
                        "/api/auth/**",
                        "/images/**",
                        "/profile/**",
                        "/api/ai-diary/**"
                ).permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
        );


        // 4. 폼 로그인 비활성화 및 기본 HTTP Basic 인증 설정
        http.formLogin(AbstractHttpConfigurer::disable);
        http.httpBasic(AbstractHttpConfigurer::disable);

        // (5) 인증/인가 예외 처리
        http.exceptionHandling(exception -> exception
            // 5-1) 인증 실패 시 401 반환
            .authenticationEntryPoint((request, response, authException) -> {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
            })
            // 5-2) 권한 부족 시 403 반환
            .accessDeniedHandler((request, response, accessDeniedException) -> {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Forbidden");
            })
        );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // BCryptPasswordEncoder 빈 등록 (JWT 및 로컬 로그인 시 필요)
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
