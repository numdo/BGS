package com.ssafy.bgs.user.controller;

import com.ssafy.bgs.auth.dto.request.SocialSignupRequestDto;
import com.ssafy.bgs.user.dto.request.*;
import com.ssafy.bgs.user.dto.response.LoginResponseDto;
import com.ssafy.bgs.user.dto.response.PasswordResetResponseDto;
import com.ssafy.bgs.user.dto.response.UserResponseDto;
import com.ssafy.bgs.user.service.EmailService;
import com.ssafy.bgs.user.service.UserService;
import com.ssafy.bgs.user.service.VerificationService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final EmailService emailService;
    private final VerificationService verificationService;
    private final Map<String, String> verificationStorage = new HashMap<>();

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody UserSignupRequestDto signupRequest) {
        String email = signupRequest.getEmail();
        if (!verificationService.isEmailVerified(email)) {
            return ResponseEntity.badRequest().body("이메일 인증이 완료되지 않았습니다.");
        }
        UserResponseDto response = userService.signup(signupRequest);
        verificationService.removeVerificationCode(email);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/email-verification")
    public ResponseEntity<?> sendEmailVerification(@RequestParam String email) {
        String verificationCode = emailService.sendVerificationEmail(email);
        verificationService.storeVerificationCode(email, verificationCode);
        return ResponseEntity.ok("인증 코드가 전송되었습니다.");
    }

    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestParam String email, @RequestParam String code) {
        boolean verified = verificationService.verifyCode(email, code);
        return verified ? ResponseEntity.ok("이메일 인증 성공") : ResponseEntity.badRequest().body("인증 코드가 일치하지 않습니다.");
    }

    @PatchMapping("/me/social-signup")
    public ResponseEntity<?> kakaoSignup(Authentication authentication, @RequestBody SocialSignupRequestDto socialSignupRequestDto) {
        Integer userId = (Integer) authentication.getPrincipal();
        UserResponseDto result = userService.socialSignup(userId, socialSignupRequestDto);
        return ResponseEntity.ok(result);
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers(@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "10") int pageSize) {
        Page<UserResponseDto> result = userService.getAllUsers(page, pageSize);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDto loginRequest, HttpServletResponse response) {
        LoginResponseDto loginResponseDto = userService.login(loginRequest.getEmail(), loginRequest.getPassword());
        response.setHeader("Authorization", "Bearer " + loginResponseDto.getAccessToken());
        response.setHeader("Refresh-Token", "Bearer " + loginResponseDto.getRefreshToken());
        return ResponseEntity.ok(loginResponseDto);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(Authentication authentication) {
        Integer userId = (Integer) authentication.getPrincipal();
        userService.logout(userId);
        return ResponseEntity.ok("로그아웃 성공");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getUserInfo(Authentication authentication) {
        Integer userId = (Integer) authentication.getPrincipal();
        UserResponseDto response = userService.getUserInfo(userId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping(value = "/me")
    public ResponseEntity<?> updateUserInfo(Authentication authentication, @RequestBody UserUpdateRequestDto userInfo) {
        Integer userId = (Integer) authentication.getPrincipal();
        UserResponseDto response = userService.updateUserInfo(userId, userInfo);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteUser(Authentication authentication) {
        Integer userId = (Integer) authentication.getPrincipal();
        userService.deleteUser(userId);
        return ResponseEntity.ok("{\"message\":\"탈퇴 처리되었습니다.\"}");
    }

    @GetMapping("/nickname-check/{nickname}")
    public ResponseEntity<?> checkNickname(@PathVariable String nickname) {
        boolean available = userService.checkNickname(nickname);
        return ResponseEntity.ok().body(new NicknameCheckResponse(available));
    }

    record NicknameCheckResponse(boolean available) {}

    @PostMapping("/me/attendance")
    public ResponseEntity<?> checkAttendance(Authentication authentication) {
        Integer userId = (Integer) authentication.getPrincipal();
        userService.checkAttendance(userId);
        return ResponseEntity.ok("{\"message\":\"출석 체크가 완료되었습니다.\"}");
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@Valid @RequestBody PasswordChangeRequestDto requestDto, Authentication authentication) {
        Integer userId = (Integer) authentication.getPrincipal();
        userService.changePassword(userId, requestDto);
        return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
    }

    @PatchMapping(value = "/me/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProfileImage(Authentication authentication, @RequestPart("profileImage") MultipartFile profileImage) {
        Integer userId = (Integer) authentication.getPrincipal();
        UserResponseDto response = userService.updateProfileImage(userId, profileImage);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<PasswordResetResponseDto> resetPassword(@Valid @RequestBody PasswordResetRequestDto requestDto) {
        PasswordResetResponseDto response = userService.resetPassword(requestDto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/attendance")
    public ResponseEntity<?> getAttendance(Authentication authentication) {
        Integer userId = (Integer) authentication.getPrincipal();
        UserResponseDto response = userService.getAttendance(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/following/{followeeId}")
    public ResponseEntity<?> followUser(
            @PathVariable Integer followeeId,
            Authentication authentication
    ) {
        Integer followerId = (Integer) authentication.getPrincipal();
        userService.followUser(followerId, followeeId);
        return ResponseEntity.ok("팔로잉 성공");
    }

    @DeleteMapping("/following/{followeeId}")
    public ResponseEntity<?> unfollowUser(
            @PathVariable Integer followeeId,
            Authentication authentication
    ) {
        Integer followerId = (Integer) authentication.getPrincipal();
        userService.unfollowUser(followerId, followeeId);
        return ResponseEntity.ok("언팔로잉 성공");
    }

    @GetMapping("/following")
    public ResponseEntity<?> getFollowingList(
            Authentication authentication,
            @RequestParam(required = false) String nickname
    ) {
        Integer userId = (Integer) authentication.getPrincipal();
        List<UserResponseDto> list = userService.getFollowingList(userId, nickname);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/follower")
    public ResponseEntity<?> getFollowerList(
            Authentication authentication,
            @RequestParam(required = false) String nickname
    ) {
        Integer userId = (Integer) authentication.getPrincipal();
        List<UserResponseDto> list = userService.getFollowerList(userId, nickname);
        return ResponseEntity.ok(list);
    }

}
