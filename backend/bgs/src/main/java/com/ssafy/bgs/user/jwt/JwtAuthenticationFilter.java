package com.ssafy.bgs.user.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        try {
            // 1. Header에서 Token 추출
            String token = resolveToken(request);

            // 2. 토큰이 존재하고, 유효하면 인증 객체 생성
            if (token != null && jwtTokenProvider.validateToken(token,true)) {
                // JWT에서 userId 추출
                Integer userId = jwtTokenProvider.getUserId(token, true);

                // Principal = userId, Credentials = null, Authorities = null
                UsernamePasswordAuthenticationToken authenticationToken =
                        new UsernamePasswordAuthenticationToken(userId, null, null);

                // SecurityContextHolder에 등록
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }

            // 다음 필터로 진행
            filterChain.doFilter(request, response);

        } catch (Exception e) {
            // 토큰이 유효하지 않거나, 검증 중 에러가 발생하면 401 반환
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        }
    }

    /**
     * "Authorization: Bearer <TOKEN>" 헤더에서 토큰을 잘라내는 메서드
     */
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // "Bearer " 문자열 길이만큼 자르기
        }
        return null;
    }
}
