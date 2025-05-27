package com.ssafy.bgs.auth.jwt;

import com.ssafy.bgs.redis.service.RedisService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jws;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final RedisService redisService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = resolveToken(request);

        if (token != null) {
            try {
                // 토큰 파싱 (access token 여부 true)
                Jws<Claims> claimsJws = jwtTokenProvider.parseToken(token, true);
                Claims body = claimsJws.getBody();
                Integer userId = Integer.valueOf(body.getSubject());
                String role = body.get("role", String.class);
                // role에 따라 권한 설정 (예: "ADMIN"이면 ROLE_ADMIN, 아니면 ROLE_USER)
                setAuthentication(userId, role);

            } catch (ExpiredJwtException ex) {
                // Access Token 만료 처리: Refresh Token을 확인하여 재발급
                Claims expiredClaims = ex.getClaims();
                Integer userId = Integer.valueOf(expiredClaims.getSubject());
                String role = expiredClaims.get("role", String.class);

                String redisKey = "user:login:" + userId;
                String storedRefreshToken = (String) redisService.getValue(redisKey);

                if (storedRefreshToken != null && jwtTokenProvider.validateToken(storedRefreshToken, false)) {
                    // Refresh Token이 유효하면 새 Access Token 재발급 (role 정보 포함)
                    String newAccessToken = jwtTokenProvider.createAccessToken(userId, role);
                    response.setHeader("Authorization", "Bearer " + newAccessToken);
                    setAuthentication(userId, role);
                } else {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }
            } catch (Exception e) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }
        filterChain.doFilter(request, response);
    }
    /**
     * "Authorization: Bearer <TOKEN>" 헤더에서 토큰 추출
     */
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
    private void setAuthentication(Integer userId, String role) {
        List<SimpleGrantedAuthority> authorities;
        if ("ADMIN".equalsIgnoreCase(role)) {
            authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN"));
        } else {
            authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
        }
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(userId, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
    }
}
