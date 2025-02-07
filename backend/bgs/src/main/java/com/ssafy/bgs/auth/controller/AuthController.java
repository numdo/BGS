package com.ssafy.bgs.auth.controller;

import com.ssafy.bgs.auth.dto.request.LoginRequestDto;
import com.ssafy.bgs.auth.dto.request.SignupRequestDto;
import com.ssafy.bgs.auth.dto.request.SocialSignupRequestDto;
import com.ssafy.bgs.auth.dto.response.LoginResponseDto;
import com.ssafy.bgs.redis.service.RedisService;
import com.ssafy.bgs.auth.dto.response.SocialLoginResponseDto;
import com.ssafy.bgs.auth.jwt.JwtTokenProvider;
import com.ssafy.bgs.auth.service.AuthService;
import com.ssafy.bgs.user.controller.UserController;
import com.ssafy.bgs.user.dto.request.PasswordResetRequestDto;
import com.ssafy.bgs.user.dto.response.PasswordResetResponseDto;
import com.ssafy.bgs.user.dto.response.UserResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
    public void kakaoCallback(
            @RequestParam(required = false) String code,
            HttpServletResponse response // 주입
    ) throws IOException {
        if (!StringUtils.hasText(code)) {
            response.sendError(HttpStatus.BAD_REQUEST.value(), "인가코드(code)가 존재하지 않습니다.");
            return;
        }

        // 카카오 로그인 처리 후, 우리 서비스의 JWT 발급
        SocialLoginResponseDto loginResponse = authService.kakaoLogin(code);

        // **추가**: JWT 토큰을 Response Header에 담아서 내려주기
        // 프론트엔드로 전달할 URL (예시: 프론트엔드의 특정 라우터 주소)
        String frontRedirectUrl = "http://localhost:5173/auth/kakao/callback";

        // 토큰을 URL 파라미터(혹은 fragment)로 붙여서 전달 (여기서는 fragment 예시)
        String redirectUrl = frontRedirectUrl
                + "#accessToken=" + loginResponse.getAccessToken();

        // 프론트엔드로 리다이렉트
        response.sendRedirect(redirectUrl);
    }

    @PatchMapping("/me/social-signup")
    public ResponseEntity<?> socialSignup(Authentication authentication, @RequestBody SocialSignupRequestDto socialSignupRequestDto) {
        // 인증된 사용자 ID를 통해 기존 카카오 계정의 추가 정보를 업데이트
        Integer userId = (Integer) authentication.getPrincipal();
        UserResponseDto updatedUser = authService.socialSignup(userId, socialSignupRequestDto);
        return ResponseEntity.ok(updatedUser);
    }

    // 회원가입 (이메일 인증까지 완료된 상태여야 함)
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequestDto signupRequest) {
        authService.signup(signupRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body("회원가입 성공");
    }

    // 로그인 (로컬 계정)
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDto loginRequest, HttpServletResponse response) {
        LoginResponseDto loginResponse = authService.login(loginRequest.getEmail(), loginRequest.getPassword());
        // 예: accessToken과 refreshToken을 헤더 또는 httpOnly 쿠키로 설정할 수 있음.
        response.setHeader("Authorization", "Bearer " + loginResponse.getAccessToken());
        return ResponseEntity.ok(loginResponse.isTemporaryPassword());
    }

    // 로그아웃 (Redis에서 refresh 토큰 삭제)
    @PostMapping("/logout")
    public ResponseEntity<?> logout(Authentication authentication) {
        Integer userId = (Integer) authentication.getPrincipal();
        authService.logout(userId);
        return ResponseEntity.ok("로그아웃 성공");
    }

    // 이메일 인증 코드 전송
    @PostMapping("/email-verification")
    public ResponseEntity<?> sendVerification(@RequestParam String email) {
        authService.sendVerificationEmail(email);
        return ResponseEntity.ok("인증 코드가 전송되었습니다.");
    }

    // 인증 코드 검증
    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestParam String email, @RequestParam String code) {
        boolean verified = authService.verifyCode(email, code);
        return verified ? ResponseEntity.ok("이메일 인증 성공")
                : ResponseEntity.badRequest().body("인증 코드가 일치하지 않습니다.");
    }
    @GetMapping("/nickname-check/{nickname}")
    public ResponseEntity<?> checkNickname(@PathVariable String nickname) {
        boolean available = authService.checkNickname(nickname);
        return ResponseEntity.ok().body(new AuthController.NicknameCheckResponse(available));
    }
    @PostMapping("/reset-password")
    public ResponseEntity<PasswordResetResponseDto> resetPassword(@Valid @RequestBody PasswordResetRequestDto requestDto) {
        PasswordResetResponseDto response = authService.resetPassword(requestDto);
        return ResponseEntity.ok(response);
    }
    record NicknameCheckResponse(boolean available) {}


}
