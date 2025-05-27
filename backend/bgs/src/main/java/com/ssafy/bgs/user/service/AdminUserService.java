package com.ssafy.bgs.user.service;

import com.ssafy.bgs.redis.service.RedisService;
import com.ssafy.bgs.user.dto.request.AdminUpdateUserRequestDto;
import com.ssafy.bgs.user.dto.response.AdminUserResponseDto;
import com.ssafy.bgs.user.entity.User;
import com.ssafy.bgs.user.exception.UserNotFoundException;
import com.ssafy.bgs.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminUserService {

    private final UserRepository userRepository;
    private final RedisService redisService;
    private final PasswordEncoder passwordEncoder;
    /**
     * 관리자 전용 회원 목록 조회 (페이징, 검색 가능)
     */
    @Transactional(readOnly = true)
    public Page<AdminUserResponseDto> adminGetAllUsers(int page, int pageSize, String keyword) {
        // 0-based page index
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, Sort.by("id").descending());
        Page<User> result;
        if (keyword != null && !keyword.isBlank()) {
            result = userRepository.findByNicknameContainingIgnoreCaseAndDeletedFalse(keyword, pageRequest);
        } else {
            result = userRepository.findAllByDeletedFalse(pageRequest);
        }
        return result.map(this::toAdminUserResponseDto);
    }


    /**
     * 관리자 전용 회원 정보 수정
     * 수정 가능한 필드: nickname, email, role 등 (AdminUpdateUserRequestDto에 정의)
     */
    @Transactional
    public AdminUserResponseDto adminUpdateUser(Integer userId, AdminUpdateUserRequestDto requestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        // 예시: 닉네임, 이메일, role 업데이트
        if (requestDto.getNickname() != null) {
            user.setNickname(requestDto.getNickname());
        }
        if (requestDto.getEmail() != null) {
            user.setEmail(requestDto.getEmail());
        }
        if (requestDto.getRole() != null) {
            user.setRole(requestDto.getRole());
        }
        // 필요한 경우 추가 필드 업데이트

        User updatedUser = userRepository.save(user);
        return toAdminUserResponseDto(updatedUser);
    }

    /**
     * 관리자 전용 회원 삭제 (소프트 삭제)
     */
    @Transactional
    public void adminDeleteUser(Integer userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        user.setEmail(null);
        user.setName(null);
        user.setSex(null);
        user.setBirthDate(null);
        user.setPassword(null);
        user.setHeight(null);
        user.setWeight(null);
        user.setSocialId(null);
        user.setAccountType(null);
        user.setDeleted(true); // resigned = true 로 소프트삭제 처리
        redisService.deleteValue("user:" + userId);
        // 추가로 이메일, 비밀번호 등 민감정보를 제거할 수 있음
        userRepository.save(user);
    }

    /**
     * 관리자 전용 비밀번호 재설정
     */
    @Transactional
    public void adminResetPassword(Integer userId, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        String encodedNewPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encodedNewPassword);
        userRepository.save(user);
    }
    private AdminUserResponseDto toAdminUserResponseDto(User user) {
        return AdminUserResponseDto.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .nickname(user.getNickname())
                .birthDate(user.getBirthDate())
                .sex(user.getSex() == null ? null : user.getSex().toString())
                .height(user.getHeight())
                .weight(user.getWeight())
                .degree(user.getDegree() != null ? user.getDegree().doubleValue() : null)
                .introduction(user.getIntroduction())
                .totalWeight(user.getTotalWeight() != null ? user.getTotalWeight().doubleValue() : null)
                .deleted(user.getDeleted())
                .strickAttendance(user.getStrickAttendance())
                .lastAttendance(user.getLastAttendance())
                .coin(user.getCoin())
                .role(user.getRole())
                .profileImageUrl(null) // 여기서는 기본 null로 두고, 호출부에서 최신 이미지를 세팅
                .build();
    }
}
