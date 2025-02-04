package com.ssafy.bgs.auth.config;

import com.ssafy.bgs.auth.handler.CustomOAuth2AuthenticationSuccessHandler;
import com.ssafy.bgs.auth.jwt.JwtAuthenticationFilter;
import com.ssafy.bgs.auth.service.CustomOAuth2UserService;
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

    private final CustomOAuth2UserService customOAuth2UserService;

    private final CustomOAuth2AuthenticationSuccessHandler successHandler;

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
                .requestMatchers("/login/oauth2/**").permitAll()
                .requestMatchers("/images/**").permitAll()
                .requestMatchers("/profile/**").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
        );

        // 4. 폼 로그인 비활성화 및 기본 HTTP Basic 인증 설정
        http.formLogin(form -> form.disable());
        http.httpBasic(Customizer.withDefaults());

        http.oauth2Login(oauth2 -> oauth2
                // 로그인 성공 후 기본 리다이렉트 URL을 지정하거나 커스텀 핸들러를 사용할 수 있음
                .defaultSuccessUrl("/auth/google/success", true)
                .successHandler(successHandler)
                .failureUrl("/api/auth/oauth2/failure")
                .userInfoEndpoint(userInfo -> userInfo
                        .userService(customOAuth2UserService)
                )
        );
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
