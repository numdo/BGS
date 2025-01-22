package com.ssafy.bgs.user.jwt;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) {

        try {
            String token = resolveToken(request);
            if (token != null && jwtTokenProvider.validateToken(token,true)) {
                // 토큰이 유효할 경우, userId를 추출하여 인증 정보 생성
                Integer userId = jwtTokenProvider.getUserId(token);

                // 예시로 UsernamePasswordAuthenticationToken를 생성해서 SecurityContext 저장
                // 실제로는 UserDetailsService를 통해 유저정보를 load해도 됨
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(userId, null, null);

                SecurityContextHolder.getContext().setAuthentication(auth);
            }
            filterChain.doFilter(request, response);

        } catch (Exception e) {
            // 토큰이 유효하지 않거나 에러 => HTTP 401 응답 (예시)
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        }
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        // "Authorization: Bearer <token>" 형태 가정
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // "Bearer " 이후 문자열 자르기
        }
        return null;
    }
}
