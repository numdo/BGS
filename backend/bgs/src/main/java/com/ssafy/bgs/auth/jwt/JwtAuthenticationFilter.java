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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

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
                // 1) 유효한 Access Token인 경우 -> 인증 처리
                Jws<Claims> claims = jwtTokenProvider.parseToken(token, true);
                // parseToken()에 성공 -> 만료X, 서명O
                Integer userId = Integer.valueOf(claims.getBody().getSubject());
                setAuthentication(userId);

            } catch (ExpiredJwtException ex) {
                // 2) Access Token 만료된 경우 -> Refresh Token 확인 후 재발급
                Integer userId = Integer.valueOf(ex.getClaims().getSubject());
                String redisKey = "user:login:" + userId;
                String storedRefreshToken = (String) redisService.getValue(redisKey);

                if (storedRefreshToken != null && jwtTokenProvider.validateToken(storedRefreshToken, false)) {
                    // ★ Refresh가 유효 -> 새 Access 발급, 응답 헤더에 넣고 200 OK
                    String newAccessToken = jwtTokenProvider.createAccessToken(userId);
                    response.setHeader("Authorization", "Bearer " + newAccessToken);
                    setAuthentication(userId);
                } else {
                    // Refresh Token도 없거나 만료 -> 정말 로그인 불가 -> 401
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }
            } catch (Exception e) {
                // 토큰 자체가 잘못됨 -> 401
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }
        // 여기까지 왔으면 정상. 필터 체인 진행
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
    private void setAuthentication(Integer userId) {
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(userId, null, null);
        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
    }
}
