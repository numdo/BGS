package com.ssafy.bgs.user.controller;


import com.ssafy.bgs.user.dto.request.KakaoSignupRequestDto;
import com.ssafy.bgs.user.dto.request.LoginRequestDto;
import com.ssafy.bgs.user.dto.request.UserSignupRequestDto;
import com.ssafy.bgs.user.dto.request.UserUpdateRequestDto;
import com.ssafy.bgs.user.dto.response.LoginResponseDto;
import com.ssafy.bgs.user.dto.response.UserResponseDto;
import com.ssafy.bgs.user.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    /**
     * 회원가입
     * [POST] /api/users/signup
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody UserSignupRequestDto signupRequest) {
        try {
            UserResponseDto response = userService.signup(signupRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 카카오 로그인 후 회원가입
     * @param userId
     * @param kakaoSignupRequestDto
     * @return
     */
    @PatchMapping("/{userId}/kakao-signup")
    public ResponseEntity<?> kakaoSignup(
            @PathVariable Integer userId,
            @RequestBody KakaoSignupRequestDto kakaoSignupRequestDto
    ) {
        try {
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
        LoginResponseDto loginResponse = userService.login(loginRequest.getEmail(), loginRequest.getPassword());

        // **추가**: 토큰을 Response Header에 담아서 내려주기
        response.setHeader("Authorization", "Bearer " + loginResponse.getAccessToken());
        response.setHeader("Refresh-Token", "Bearer " + loginResponse.getRefreshToken());

        return ResponseEntity.ok(loginResponse);
    }
    /**
     * 로그아웃 (예시)
     * 실제로는 세션/토큰 만료 로직 등이 필요
     * [POST] /api/users/logout?userId=xxx
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestParam Integer userId) {
        try {
            userService.logout(userId);
            return ResponseEntity.ok("로그아웃 성공");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 내정보 조회
     * [GET] /api/users/{userId}
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserInfo(@PathVariable Integer userId) {
        try {
            UserResponseDto response = userService.getUserInfo(userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * 내정보 변경
     * [PATCH] /api/users/{userId}
     */
    @PatchMapping("/{userId}")
    public ResponseEntity<?> updateUserInfo(
            @PathVariable Integer userId,
            @RequestBody UserUpdateRequestDto updateRequest
    ) {
        try {
            UserResponseDto response =  userService.updateUserInfo(userId, updateRequest);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (RuntimeException e) {
            // 예: "사용자를 찾을 수 없습니다." -> 404
            if (e.getMessage().contains("찾을 수 없습니다")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 회원 탈퇴
     * [DELETE] /api/users/{userId}
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer userId) {
        try {
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
     * [POST] /api/users/{userId}/attendance
     */
    @PostMapping("/{userId}/attendance")
    public ResponseEntity<?> checkAttendance(@PathVariable Integer userId) {
        try {
            userService.checkAttendance(userId);
            return ResponseEntity.ok("{\"message\":\"출석 체크가 완료되었습니다.\"}");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * 출석 정보 조회
     * [GET] /api/users/{userId}/attendance
     */
    @GetMapping("/{userId}/attendance")
    public ResponseEntity<?> getAttendance(@PathVariable Integer userId) {
        try {
            UserResponseDto response = userService.getAttendance(userId);
            // 예: 연속 출석 일수만 반환하거나, 전체 User 정보를 반환할 수도 있음
            // 여기서는 전체 정보를 반환한다고 가정
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * 팔로잉
     * [POST] /api/users/following/{userId}
     * requestBody에 { "followerId": ... } 구조
     */
    @PostMapping("/following/{userId}")
    public ResponseEntity<?> followUser(
            @PathVariable Integer userId,
            @RequestBody FollowRequest followRequest
    ) {
        try {
            userService.followUser(userId, followRequest.followerId());
            return ResponseEntity.ok("팔로잉 성공");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    // requestBody에 팔로우를 건 user의 ID
    record FollowRequest(Integer followerId) { }

    /**
     * 언팔로잉
     * [DELETE] /api/users/following/{userId}?followerId=xxx
     */
    @DeleteMapping("/following/{userId}")
    public ResponseEntity<?> unfollowUser(
            @PathVariable Integer userId,
            @RequestParam Integer followerId
    ) {
        try {
            userService.unfollowUser(userId, followerId);
            return ResponseEntity.ok("언팔로잉 성공");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * 팔로잉 목록 조회
     * [GET] /api/users/{userId}/following?nickname=...
     */
    @GetMapping("/{userId}/following")
    public ResponseEntity<?> getFollowingList(
            @PathVariable Integer userId,
            @RequestParam(required = false) String nickname
    ) {
        try {
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
    @GetMapping("/{userId}/follower")
    public ResponseEntity<?> getFollowerList(
            @PathVariable Integer userId,
            @RequestParam(required = false) String nickname
    ) {
        try {
            List<UserResponseDto> list = userService.getFollowerList(userId, nickname);
            return ResponseEntity.ok(list);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
