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

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        // 1. CSRF 비활성화 (REST API 형태)
        http.csrf(csrf -> csrf.disable());

        // 2. URL별 권한 설정
        // 소셜 로그인 관련 엔드포인트 (예: Kakao)는 '/api/auth/**'로 관리하고,
        // 로컬 회원가입 API 등은 '/api/users/signup' 등으로 별도 관리
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/users/signup").permitAll()
                // 필요에 따라 로컬 로그인 API를 사용한다면 permitAll 처리
                .requestMatchers("/api/users/login").permitAll()
                .anyRequest().authenticated()
        );

        // 3. OAuth2 로그인 사용 시 (Spring Security OAuth2 Client)
        // properties 파일에 이미 Kakao 관련 설정이 되어 있으므로, oauth2Login을 활성화합니다.
//        http.oauth2Login(oauth2 -> oauth2
//                // 로그인 성공 후 기본 리다이렉트 URL 또는 successHandler를 설정할 수 있습니다.
//                .defaultSuccessUrl("/home", true)
//        );

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
