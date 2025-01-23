package com.ssafy.bgs.user.controller;

import com.ssafy.bgs.user.dto.response.LoginResponseDto;
import com.ssafy.bgs.user.service.KakaoAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.util.StringUtils;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@RestController
@RequestMapping("/api/auth/kakao")
@RequiredArgsConstructor
public class KakaoAuthController {

    private final KakaoAuthService kakaoAuthService;

    // application.yaml에 등록된 값
    @Value("${kakao.oauth.client-id}")
    private String kakaoClientId;

    @Value("${kakao.oauth.redirect-uri}")
    private String kakaoRedirectUri;

    /**
     * 1) 카카오 로그인 유도 (프론트에서 직접 링크 이동해도 무방)
     * GET /api/auth/kakao/login
     */
    @GetMapping("/login")
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
    @GetMapping("/callback")
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
            LoginResponseDto loginResponse = kakaoAuthService.kakaoLogin(code);

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

}
