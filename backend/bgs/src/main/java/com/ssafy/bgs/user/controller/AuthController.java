package com.ssafy.bgs.user.controller;

import com.ssafy.bgs.redis.service.RedisService;
import com.ssafy.bgs.user.dto.response.SocialLoginResponseDto;
import com.ssafy.bgs.user.jwt.JwtTokenProvider;
import com.ssafy.bgs.user.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.util.StringUtils;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;
    private final RedisService redisService;

    // application.properties 에 등록된 값
    @Value("${kakao.oauth.client-id}")
    private String kakaoClientId;

    @Value("${kakao.oauth.redirect-uri}")
    private String kakaoRedirectUri;

    /**
     * 1) 카카오 로그인 유도 (프론트에서 직접 링크 이동해도 무방)
     * GET /api/auth/kakao/login
     */
    @GetMapping("/kakao/login")
    public void redirectKakaoLogin(HttpServletResponse response) throws IOException {
        // 카카오 로그인 페이지로 리다이렉트
        // (실무에서는 프론트가 이 URL로 직접 이동하는 경우가 많음)
        String url = "https://kauth.kakao.com/oauth/authorize"
                + "?client_id=" + kakaoClientId
                + "&redirect_uri=" + kakaoRedirectUri
                + "&response_type=code";
        response.sendRedirect(url);
    }

    /**
     * 2) 카카오 로그인 콜백
     * GET /api/auth/kakao/callback?code=xxx
     */
    @GetMapping("/kakao/callback")
    public ResponseEntity<?> kakaoCallback(
            @RequestParam(required = false) String code,
            HttpServletResponse response // 주입
    ) {
        if (!StringUtils.hasText(code)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("인가코드(code)가 존재하지 않습니다.");
        }

        try {
            // 카카오 로그인 처리 후, 우리 서비스의 JWT 발급
            SocialLoginResponseDto loginResponse = authService.kakaoLogin(code);

            // **추가**: JWT 토큰을 Response Header에 담아서 내려주기
            response.setHeader("Authorization", "Bearer " + loginResponse.getAccessToken());
            response.setHeader("Refresh-Token", "Bearer " + loginResponse.getRefreshToken());

            // 바디로도 JSON 형태로 반환
            return ResponseEntity.ok(loginResponse);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("카카오 소셜 로그인 실패: " + e.getMessage());
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshAccessToken(
            @RequestHeader("Refresh-Token") String refreshToken) {

        // 1. Refresh Token 유효성 검사 (isAccessToken=false)
        if (!jwtTokenProvider.validateToken(refreshToken, false)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }

        // 2. 새로운 Access Token 발급
        String newAccessToken = jwtTokenProvider.recreateAccessToken(refreshToken);

        return ResponseEntity.ok()
                .header("Authorization", "Bearer " + newAccessToken)
                .build();
    }

}
