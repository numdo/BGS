package com.ssafy.bgs.user.controller;


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
    private final Map<String, String> verificationStorage = new HashMap<>(); // 간단한 인증 코드 저장

    /**
     * 회원가입
     * [POST] /api/users/signup
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody UserSignupRequestDto signupRequest) {
        String email = signupRequest.getEmail();

        // 1. 이메일 인증 여부 확인
        if (!verificationService.isEmailVerified(email)) {
            return ResponseEntity.badRequest().body("이메일 인증이 완료되지 않았습니다.");
        }

        try {
            UserResponseDto response = userService.signup(signupRequest);

            verificationService.removeVerificationCode(email); // 인증 상태 삭제

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 이메일 인증 코드 전송
     * [POST] /api/users/email-verification
     */
    @PostMapping("/email-verification")
    public ResponseEntity<?> sendEmailVerification(@RequestParam String email) {
        try {
            String verificationCode = emailService.sendVerificationEmail(email);
            verificationService.storeVerificationCode(email, verificationCode); // 인증 코드 저장
            return ResponseEntity.ok("인증 코드가 전송되었습니다.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 이메일 인증 코드 확인
     * [POST] /api/users/verify-code
     */
    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestParam String email, @RequestParam String code) {
        boolean verified = verificationService.verifyCode(email, code);
        if (verified) {
            return ResponseEntity.ok("이메일 인증 성공");
        } else {
            return ResponseEntity.badRequest().body("인증 코드가 일치하지 않습니다.");
        }
    }

    /**
     * (카카오 로그인 후) 추가 정보 입력
     * 기존에는 @PathVariable userId를 받았으나,
     * 이제는 JWT로 인증된 사용자 본인의 ID를 사용.
     * [PATCH] /api/users/me/kakao-signup
     */
    @PatchMapping("/me/kakao-signup")
    public ResponseEntity<?> kakaoSignup(
            Authentication authentication,
            @RequestBody KakaoSignupRequestDto kakaoSignupRequestDto
    ) {
        try {
            Integer userId = (Integer) authentication.getPrincipal();
            UserResponseDto result = userService.kakaoSignup(userId, kakaoSignupRequestDto);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    /**
     * 전체 회원 조회 (페이지네이션)
     * [GET] /api/users?page=1&pageSize=10
     */
    @GetMapping
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize
    ) {
        try {
            Page<UserResponseDto> result = userService.getAllUsers(page, pageSize);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 로그인
     * @param loginRequest
     * @return
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDto loginRequest, HttpServletResponse response) {
        LoginResponseDto loginResponseDto = userService.login(loginRequest.getEmail(), loginRequest.getPassword());

        // **추가**: 토큰을 Response Header에 담아서 내려주기
        response.setHeader("Authorization", "Bearer " + loginResponseDto.getAccessToken());
        response.setHeader("Refresh-Token", "Bearer " + loginResponseDto.getRefreshToken());

        return ResponseEntity.ok(loginResponseDto);
    }
    /**
     * 로그아웃 (기본 예시)
     * 기존에는 ?userId=xxx 형태로 받았으나, 이제는 JWT에서 userId 추출
     * [POST] /api/users/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(Authentication authentication) {
        try {
            Integer userId = (Integer) authentication.getPrincipal();
            userService.logout(userId);
            return ResponseEntity.ok("로그아웃 성공");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 내 정보 조회
     * [GET] /api/users/me
     */
    @GetMapping("/me")
    public ResponseEntity<?> getUserInfo(Authentication authentication) {
        try {
            Integer userId = (Integer) authentication.getPrincipal();
            UserResponseDto response = userService.getUserInfo(userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }



    /**
     * 내 정보 변경
     * [PATCH] /api/users/me
     */
    @PatchMapping(value = "/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateUserInfo(
            Authentication authentication,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage,
            @RequestPart("userInfo") UserUpdateRequestDto userInfo
    ) {
        try {
            Integer userId = (Integer) authentication.getPrincipal();
            UserResponseDto response = userService.updateUserInfo(userId, userInfo, profileImage);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("찾을 수 없습니다")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 회원 탈퇴
     * 기존: [DELETE] /api/users/{userId}
     * 변경: [DELETE] /api/users/me
     */
    @DeleteMapping("/me")
    public ResponseEntity<?> deleteUser(Authentication authentication) {
        try {
            Integer userId = (Integer) authentication.getPrincipal();
            userService.deleteUser(userId);
            return ResponseEntity.ok("{\"message\":\"탈퇴 처리되었습니다.\"}");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * 닉네임 중복 조회
     * [GET] /api/users/nickname-check/{nickname}
     */
    @GetMapping("/nickname-check/{nickname}")
    public ResponseEntity<?> checkNickname(@PathVariable String nickname) {
        if (nickname == null || nickname.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("닉네임이 비어있습니다.");
        }
        try {
            boolean available = userService.checkNickname(nickname);
            return ResponseEntity.ok().body(new NicknameCheckResponse(available));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    // 단순 응답용 record (Java 16+)
    record NicknameCheckResponse(boolean available) { }

    /**
     * 출석 체크
     * 기존: [POST] /api/users/{userId}/attendance
     * 변경: [POST] /api/users/me/attendance
     */
    @PostMapping("/me/attendance")
    public ResponseEntity<?> checkAttendance(Authentication authentication) {
        try {
            Integer userId = (Integer) authentication.getPrincipal();
            userService.checkAttendance(userId);
            return ResponseEntity.ok("{\"message\":\"출석 체크가 완료되었습니다.\"}");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * 비밀번호 변경 (로컬)
     * [POST] /api/users/change-password
     */
    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@Valid @RequestBody PasswordChangeRequestDto requestDto,
                                                 Authentication authentication) {
        Integer userId = (Integer) authentication.getPrincipal();
        userService.changePassword(userId, requestDto);
        return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
    }


    /**
     * 비밀번호 재설정 (이메일 인증 후)
     * [POST] /api/users/reset-password
     */
    @PostMapping("/reset-password")
    public ResponseEntity<PasswordResetResponseDto> resetPassword(@Valid @RequestBody PasswordResetRequestDto requestDto) {
        PasswordResetResponseDto response = userService.resetPassword(requestDto);
        return ResponseEntity.ok(response);
    }

    /**
     * 출석 정보 조회
     * 기존: [GET] /api/users/{userId}/attendance
     * 변경: [GET] /api/users/me/attendance
     */
    @GetMapping("/me/attendance")
    public ResponseEntity<?> getAttendance(Authentication authentication) {
        try {
            Integer userId = (Integer) authentication.getPrincipal();
            UserResponseDto response = userService.getAttendance(userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * 팔로잉
     * [POST] /api/users/following/{followeeId}
     * requestBody에 { "followerId": ... } 구조
     */
    @PostMapping("/following/{followeeId}")
    public ResponseEntity<?> followUser(
            @PathVariable Integer followeeId,
            Authentication authentication
    ) {
        try {
            Integer followerId = (Integer) authentication.getPrincipal(); // 인증된 사용자 ID 추출
            userService.followUser(followerId, followeeId);
            return ResponseEntity.ok("팔로잉 성공");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }


    /**
     * 언팔로잉
     * [DELETE] /api/users/following/{userId}?followerId=xxx
     */
    @DeleteMapping("/following/{followeeId}")
    public ResponseEntity<?> unfollowUser(
            @PathVariable Integer followeeId,
            Authentication authentication
    ) {
        try {
            Integer followerId = (Integer) authentication.getPrincipal(); // 인증된 사용자 ID 추출
            userService.unfollowUser(followerId, followeeId);
            return ResponseEntity.ok("언팔로잉 성공");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * 팔로우 리스트
     * @param authentication
     * @param nickname
     * @return
     */
    @GetMapping("/following")
    public ResponseEntity<?> getFollowingList(
            Authentication authentication,
            @RequestParam(required = false) String nickname
    ) {
        try {
            Integer userId = (Integer) authentication.getPrincipal();
            List<UserResponseDto> list = userService.getFollowingList(userId, nickname);
            return ResponseEntity.ok(list);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * 팔로워 목록 조회
     * [GET] /api/users/{userId}/follower?nickname=...
     */
    @GetMapping("/follower")
    public ResponseEntity<?> getFollowerList(
            Authentication authentication,
            @RequestParam(required = false) String nickname
    ) {
        try {
            Integer userId = (Integer) authentication.getPrincipal();
            List<UserResponseDto> list = userService.getFollowerList(userId, nickname);
            return ResponseEntity.ok(list);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
