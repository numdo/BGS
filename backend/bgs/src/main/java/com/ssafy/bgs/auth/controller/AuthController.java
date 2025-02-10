package com.ssafy.bgs.auth.controller;

import com.ssafy.bgs.auth.dto.request.LoginRequestDto;
import com.ssafy.bgs.auth.dto.request.SignupRequestDto;
import com.ssafy.bgs.auth.dto.request.SocialSignupRequestDto;
import com.ssafy.bgs.auth.dto.response.LoginResponseDto;
import com.ssafy.bgs.auth.service.SocialUserResponseDto;
import com.ssafy.bgs.redis.service.RedisService;
import com.ssafy.bgs.auth.dto.response.SocialLoginResponseDto;
import com.ssafy.bgs.auth.jwt.JwtTokenProvider;
import com.ssafy.bgs.auth.service.AuthService;
import com.ssafy.bgs.user.controller.UserController;
import com.ssafy.bgs.user.dto.request.PasswordResetRequestDto;
import com.ssafy.bgs.user.dto.response.PasswordResetResponseDto;
import com.ssafy.bgs.user.dto.response.UserResponseDto;
import com.ssafy.bgs.user.entity.User;
import com.ssafy.bgs.user.repository.UserRepository;
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
import java.security.Principal;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;
    private final RedisService redisService;
    private final UserRepository userRepository;

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
            HttpServletResponse response
    ) throws IOException {
        if (!StringUtils.hasText(code)) {
            response.sendError(HttpStatus.BAD_REQUEST.value(), "인가코드(code)가 존재하지 않습니다.");
            return;
        }

        SocialLoginResponseDto loginResponse = authService.kakaoLogin(code);
        String frontRedirectUrl = "https://i12c209.p.ssafy.io/auth/kakao/callback";

        // 예시: 토큰을 URL fragment에 포함 (클라이언트는 이 토큰을 분석하여 임시 토큰 여부를 판단할 수 있음)
        String redirectUrl = frontRedirectUrl + "#accessToken=" + loginResponse.getAccessToken();
        response.sendRedirect(redirectUrl);
    }

    @PatchMapping("/me/social-signup")
    public ResponseEntity<?> socialSignup(
            Authentication authentication,
            @RequestHeader("Authorization") String authHeader, // 헤더에서 토큰 가져오기
            @RequestBody SocialSignupRequestDto socialSignupRequestDto,
            HttpServletResponse response) {
        // Authorization 헤더에서 "Bearer " 제거
        String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

        // 임시 토큰인지 확인 (임시 토큰이 아니라면 추가 가입 진행 불가)
        if (!jwtTokenProvider.isTemporaryToken(token)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "임시 토큰이 아닙니다.");
        }

        // 인증된 사용자 ID는 JWT의 subject에 저장되어 있음 (예: userId)
        Integer userId = Integer.valueOf(authentication.getName());

        SocialUserResponseDto updatedUser = authService.socialSignup(userId, socialSignupRequestDto);

        response.setHeader("Authorization", "Bearer " + updatedUser.getAccessToken());

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


    @GetMapping("/nickname-check")
    public ResponseEntity<?> checkNicknameForSignup(@RequestParam String nickname) {
        // 인증 없이 단순 중복 여부만 체크
        boolean available = !userRepository.existsByNickname(nickname);
        return ResponseEntity.ok(new CheckResponse(available));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<PasswordResetResponseDto> resetPassword(@Valid @RequestBody PasswordResetRequestDto requestDto) {
        PasswordResetResponseDto response = authService.resetPassword(requestDto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/email-check/{email}")
    public ResponseEntity<?> checkEmail(@PathVariable String email) {
        boolean available = authService.checkEmail(email);
        return ResponseEntity.ok(new AuthController.CheckResponse(available));
    }

    record CheckResponse(boolean available) {}


}
