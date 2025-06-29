package com.ssafy.bgs.user.controller;

import com.ssafy.bgs.user.dto.request.*;
import com.ssafy.bgs.user.dto.response.InfoResponseDto;
import com.ssafy.bgs.user.dto.response.UserResponseDto;
import com.ssafy.bgs.user.entity.User;
import com.ssafy.bgs.user.repository.UserRepository;
import com.ssafy.bgs.user.service.EmailService;
import com.ssafy.bgs.user.service.UserService;
import com.ssafy.bgs.auth.service.VerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

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
    private final UserRepository userRepository;

    @GetMapping("/nickname-check/{nickname}")
    public ResponseEntity<?> checkNickname(@PathVariable String nickname, Authentication authentication) {
        // authentication.getName()은 JWT 생성 시 subject에 저장한 userId (문자열) 입니다.
        Integer currentUserId = Integer.valueOf(authentication.getName());
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
        String currentNickname = currentUser.getNickname();

        boolean available = userService.checkNickname(nickname, currentNickname);
        return ResponseEntity.ok(new UserController.CheckResponse(available));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getUserInfo(Authentication authentication) {
        Integer userId = (Integer) authentication.getPrincipal();
        UserResponseDto response = userService.getUserInfo(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getInfo(@PathVariable Integer userId) {
        InfoResponseDto response = userService.getInfo(userId);
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
    record CheckResponse(boolean available) {}

}
