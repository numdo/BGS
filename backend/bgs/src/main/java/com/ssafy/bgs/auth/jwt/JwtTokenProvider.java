package com.ssafy.bgs.auth.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.util.Date;

@Slf4j
@Component
public class JwtTokenProvider {

    // 실제 운영 시 yml나 환경변수에서 주입받음
    @Value("${jwt.secret-key-access}")
    private String accessSecretKey;

    @Value("${jwt.secret-key-refresh}")
    private String refreshSecretKey;

    @Value("${jwt.access-token-validity-in-ms}")
    private long accessTokenValidityInMilliseconds;

    @Value("${jwt.refresh-token-validity-in-ms}")
    private long refreshValidityInMilliseconds;

    private long temporaryTokenValidityInMilliseconds = 6000 * 100;

    private Key accessKey;
    private Key refreshKey;

    @PostConstruct
    public void init() {
        // 시크릿키를 Key 객체로 변환
        this.accessKey = Keys.hmacShaKeyFor(accessSecretKey.getBytes());
        this.refreshKey = Keys.hmacShaKeyFor(refreshSecretKey.getBytes());
    }

    /**
     * Access Token 생성
     * @param userId
     * @return
     */
    public String createAccessToken(Integer userId, String role) {
        Claims claims = Jwts.claims().setSubject(String.valueOf(userId));
        // role 클레임 추가
        claims.put("role", role);

        Date now = new Date();
        Date validity = new Date(now.getTime() + accessTokenValidityInMilliseconds);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(accessKey, SignatureAlgorithm.HS256)
                .compact();
    }
    public String createTemporaryAccessToken(Integer userId) {
        Claims claims = Jwts.claims().setSubject(String.valueOf(userId));
        // 임시 토큰임을 나타내는 클레임 추가
        claims.put("temp", true);

        Date now = new Date();
        Date validity = new Date(now.getTime() + temporaryTokenValidityInMilliseconds);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(accessKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Refresh Token 생성
     * @param userId
     * @return
     */
    public String createReFreshToken(Integer userId) {
        Claims claims = Jwts.claims().setSubject(String.valueOf(userId));

        Date now = new Date();
        Date validity = new Date(now.getTime() + refreshValidityInMilliseconds);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(refreshKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public Jws<Claims> parseToken(String token, boolean isAccessToken) {
        try {
            Key key = isAccessToken ? accessKey : refreshKey;
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
        } catch (ExpiredJwtException e) {
            log.error("Token expired: {}", e.getMessage());
            throw e; // 그대로 다시 던짐
        } catch (JwtException e) {
            log.error("Invalid token: {}", e.getMessage());
            throw new RuntimeException("Invalid token", e);
        }
    }
    /**
     * 토큰 유효성 & 만료일자 확인
     */
    public boolean validateToken(String token, boolean isAccessToken) {
        try {
            Key keyToUse = isAccessToken ? accessKey : refreshKey;
            Jwts.parserBuilder().setSigningKey(keyToUse).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid or expired JWT token", e);
            return false;
        }
    }

    /**
     * JWT에서 userId(Subject) 추출
     */
    public Integer getUserId(String token, boolean isAccessToken) {
        Key key = isAccessToken ? accessKey : refreshKey;
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return Integer.valueOf(claims.getSubject());
    }

    public boolean isTemporaryToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(accessKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            Boolean isTemp = claims.get("temp", Boolean.class);
            return isTemp != null && isTemp;
        } catch (JwtException e) {
            log.error("임시 토큰 판별 실패: {}", e.getMessage());
            return false;
        }
    }
}
