package com.ssafy.bgs.user.controller;

import com.ssafy.bgs.auth.jwt.JwtTokenProvider;
import com.ssafy.bgs.user.dto.request.AdminResetPasswordRequestDto;
import com.ssafy.bgs.user.dto.request.AdminUpdateUserRequestDto;
import com.ssafy.bgs.user.dto.response.AdminUserResponseDto;
import com.ssafy.bgs.user.dto.response.UserResponseDto;
import com.ssafy.bgs.user.service.AdminUserService;
import com.ssafy.bgs.user.service.UserService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;
    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    // 1. 회원 목록 조회 (페이징, 검색 옵션 포함)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<Page<AdminUserResponseDto>> getAllUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String keyword) {
        Page<AdminUserResponseDto> result = adminUserService.adminGetAllUsers(page, pageSize, keyword);
        return ResponseEntity.ok(result);
    }

    // 2. 회원 상세 조회
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDto> getUserDetail(@PathVariable Integer userId) {
        UserResponseDto response = userService.getUserInfo(userId);
        return ResponseEntity.ok(response);
    }

    // 3. 회원 정보 수정 (관리자 전용)
    @PatchMapping("/{userId}")
    public ResponseEntity<?> updateUser(
            @PathVariable Integer userId,
            @RequestBody AdminUpdateUserRequestDto requestDto) {
        AdminUserResponseDto response = adminUserService.adminUpdateUser(userId, requestDto);
        return ResponseEntity.ok(response);
    }

    // 4. 회원 삭제 (소프트 삭제)
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer userId) {
        adminUserService.adminDeleteUser(userId);
        return ResponseEntity.ok("{\"message\":\"회원이 삭제되었습니다.\"}");
    }

    // 5. 비밀번호 초기화/재설정
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{userId}/reset-password")
    public ResponseEntity<?> resetPassword(
            @PathVariable Integer userId,
            @RequestBody AdminResetPasswordRequestDto requestDto) {
        adminUserService.adminResetPassword(userId, requestDto.getNewPassword());
        return ResponseEntity.ok("{\"message\":\"비밀번호가 재설정되었습니다.\"}");
    }
}
