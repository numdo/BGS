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

        // 1. CSRF 비활성화
        http.csrf(csrf -> csrf.disable());

        // 2. URL별 권한 설정
        http.authorizeHttpRequests(auth -> auth
                // 로그인, 회원가입은 누구나 접근
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/users/signup").permitAll()
                .requestMatchers("/api/users/login").permitAll()
                // 그외 요청은 인증 필요
                .anyRequest().authenticated()
        );

        // 3. 폼 로그인 비활성 (REST API)
        http.formLogin(form -> form.disable());
        http.httpBasic(Customizer.withDefaults());

        // 4. JWT 필터 추가 (UsernamePasswordAuthenticationFilter 전에 실행)
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    // BCryptPasswordEncoder 빈 등록
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
