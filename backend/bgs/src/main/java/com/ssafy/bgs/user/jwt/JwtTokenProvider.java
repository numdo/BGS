package com.ssafy.bgs.user.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
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
     * @param email
     * @return
     */
    public String createAccessToken(Integer userId, String email) {
        Claims claims = Jwts.claims().setSubject(String.valueOf(userId));
        claims.put("email", email);

        Date now = new Date();
        Date validity = new Date(now.getTime() + accessTokenValidityInMilliseconds);

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
     * @param email
     * @return
     */
    public String createReFreshToken(Integer userId, String email) {
        Claims claims = Jwts.claims().setSubject(String.valueOf(userId));
        claims.put("email", email);

        Date now = new Date();
        Date validity = new Date(now.getTime() + refreshValidityInMilliseconds);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(refreshKey, SignatureAlgorithm.HS256)
                .compact();
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
    public Integer getUserId(String token) {
        Claims claims = Jwts.parserBuilder().setSigningKey(accessKey).build()
                .parseClaimsJws(token)
                .getBody();
        return Integer.valueOf(claims.getSubject());
    }
}
