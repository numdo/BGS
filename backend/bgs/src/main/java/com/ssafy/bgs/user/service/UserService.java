package com.ssafy.bgs.user.service;


import com.ssafy.bgs.user.dto.request.UserSignupRequestDto;
import com.ssafy.bgs.user.dto.request.UserUpdateRequestDto;
import com.ssafy.bgs.user.dto.response.LoginResponseDto;
import com.ssafy.bgs.user.dto.response.UserResponseDto;
import com.ssafy.bgs.user.entity.Following;
import com.ssafy.bgs.user.entity.User;
import com.ssafy.bgs.user.jwt.JwtTokenProvider;
import com.ssafy.bgs.user.repository.FollowingRepository;
import com.ssafy.bgs.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final FollowingRepository followingRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 회원가입
     */
    public UserResponseDto signup(UserSignupRequestDto requestDto) {
        // 1. 닉네임 중복 체크
        if (userRepository.existsByNickname(requestDto.getNickname())) {
            throw new RuntimeException("이미 사용 중인 닉네임입니다.");
        }
        // 2. 이메일 중복 체크
        if (userRepository.findByEmail(requestDto.getEmail()).isPresent()) {
            throw new RuntimeException("이미 가입된 이메일입니다.");
        }

        // 3. 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(requestDto.getPassword());
        System.out.println("requestDto.getHeight() : " + requestDto.getHeight());
        System.out.println("requestDto.getWeight() : " + requestDto.getWeight());
        // 4. User 엔티티 생성 (기본값 설정)
        User user = new User();
        user.setEmail(requestDto.getEmail());
        user.setPassword(encodedPassword); // 해시된 비밀번호 저장
        user.setNickname(requestDto.getNickname());
        user.setName(requestDto.getName());
        user.setBirthDate(requestDto.getBirth_date());
        // sex가 "M", "F", "O" 로 들어온다고 가정, DB는 Character로 저장
        if (requestDto.getSex() != null && requestDto.getSex().length() > 0) {
            user.setSex(requestDto.getSex().charAt(0));
        }
        user.setHeight(requestDto.getHeight());
        user.setWeight(requestDto.getWeight());
        user.setDegree(BigDecimal.valueOf(36.5));  // 기본값
        user.setTotalWeight(BigDecimal.valueOf(0.0));
        user.setCoin(0);
        user.setDeleted(false);
        user.setStrickAttendance(0);

        // 5. 저장
        User savedUser = userRepository.save(user);

        // 6. 응답 DTO 변환
        return toUserResponseDto(savedUser);
    }
    /**
     * 전체 회원 조회 (페이지네이션)
     */
    @Transactional(readOnly = true)
    public Page<UserResponseDto> getAllUsers(int page, int pageSize) {
        // JPA Page는 0-based index
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, Sort.by("id").descending());
        Page<User> result = userRepository.findAll(pageRequest);
        return result.map(this::toUserResponseDto);
    }


    public LoginResponseDto login(String email, String password) {
        // 1. 이메일로 사용자를 조회
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("해당 이메일이 존재하지 않습니다."));

        // 2. 비밀번호 확인 (BCrypt)
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("비밀번호가 틀립니다.");
        }

        String accessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getEmail());
        String refreshToken = jwtTokenProvider.createReFreshToken(user.getId(), user.getEmail());

        // 3. JWT 생성 및 반환
        return LoginResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }


    public void logout(Integer userId) {
        // 별도 처리 없다고 가정
    }

    /**
     * 특정 사용자 정보 조회
     */
    @Transactional(readOnly = true)
    public UserResponseDto getUserInfo(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        return toUserResponseDto(user);
    }

    /**
     * 특정 사용자 정보 수정
     */
    public UserResponseDto updateUserInfo(Integer userId, UserUpdateRequestDto requestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 닉네임 변경 시 중복체크
        String newNickname = requestDto.getNickname();
        if (newNickname != null && !newNickname.equals(user.getNickname())) {
            // 만약 새 닉네임이 현재 사용자의 닉네임과 다르면 중복 여부 확인
            if (userRepository.existsByNickname(newNickname)) {
                throw new RuntimeException("이미 사용 중인 닉네임입니다.");
            }
            user.setNickname(newNickname);
        }

        user.setIntroduction(requestDto.getIntroduction());
        user.setBirthDate(requestDto.getBirth_date());
        user.setHeight(requestDto.getHeight());
        user.setWeight(requestDto.getWeight());
        // 수정 시 modified_at은 DB에서 default로 자동 업데이트 되거나,
        // @PreUpdate 등의 방식을 사용할 수도 있습니다.
        User updatedUser = userRepository.save(user);
        return toUserResponseDto(updatedUser);
    }

    /**
     * 회원 탈퇴 (소프트 삭제)
     */
    public void deleteUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        user.setEmail(null);
        user.setName(null);
        user.setSex(null);
        user.setBirthDate(null);
        user.setPassword(null);
        user.setHeight(null);
        user.setWeight(null);
        user.setDeleted(true); // resigned = true 로 소프트삭제 처리
    }

    /**
     * 닉네임 중복 확인
     */
    @Transactional(readOnly = true)
    public boolean checkNickname(String nickname) {
        return !userRepository.existsByNickname(nickname);
    }

    /**
     * 출석 체크
     * - 예) 당일 처음 체크 시 strick_attendance + 1
     */
    public void checkAttendance(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        LocalDate today = LocalDate.now();
        if (user.getLastAttendance() == null || !user.getLastAttendance().isEqual(today)) {
            user.setStrickAttendance(user.getStrickAttendance() + 1);
            user.setLastAttendance(today);
        }
    }

    /**
     * 출석 정보 조회
     */
    @Transactional(readOnly = true)
    public UserResponseDto getAttendance(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        return toUserResponseDto(user);
    }

    /**
     * 팔로잉 (followerId -> followeeId)
     */
    public void followUser(Integer followeeId, Integer followerId) {
        // 이미 팔로우 중인지 체크
        if (followingRepository.findByFollowerIdAndFolloweeId(followerId, followeeId).isPresent()) {
            throw new RuntimeException("이미 팔로우 중입니다.");
        }
        // 대상 사용자 존재 여부 확인
        userRepository.findById(followeeId)
                .orElseThrow(() -> new RuntimeException("팔로우 대상 사용자를 찾을 수 없습니다."));
        userRepository.findById(followerId)
                .orElseThrow(() -> new RuntimeException("팔로우를 거는 사용자를 찾을 수 없습니다."));

        Following following = Following.builder()
                .followerId(followerId)
                .followeeId(followeeId)
                .build();
        followingRepository.save(following);
    }

    /**
     * 언팔로잉
     */
    public void unfollowUser(Integer followeeId, Integer followerId) {
        Following relation = followingRepository.findByFollowerIdAndFolloweeId(followerId, followeeId)
                .orElseThrow(() -> new RuntimeException("팔로잉 관계가 없습니다."));
        followingRepository.delete(relation);
    }

    /**
     * 팔로잉 목록 조회
     * - userId가 팔로우한 사람들(=followeeId들) 조회
     */
    @Transactional(readOnly = true)
    public List<UserResponseDto> getFollowingList(Integer userId, String nicknameFilter) {
        List<Following> followings = followingRepository.findByFollowerId(userId);

        return followings.stream()
                .map(f -> userRepository.findById(f.getFolloweeId()).orElse(null))
                .filter(u -> u != null && (u.getDeleted() == null || !u.getDeleted()))
                .filter(u -> nicknameFilter == null || u.getNickname().contains(nicknameFilter))
                .map(this::toUserResponseDto)
                .toList();
    }

    /**
     * 팔로워 목록 조회
     * - userId를 팔로우하는 사람들(=followerId들) 조회
     */
    @Transactional(readOnly = true)
    public List<UserResponseDto> getFollowerList(Integer userId, String nicknameFilter) {
        List<Following> followers = followingRepository.findByFolloweeId(userId);

        return followers.stream()
                .map(f -> userRepository.findById(f.getFollowerId()).orElse(null))
                .filter(u -> u != null && (u.getDeleted() == null || !u.getDeleted()))
                .filter(u -> nicknameFilter == null || u.getNickname().contains(nicknameFilter))
                .map(this::toUserResponseDto)
                .toList();
    }

    /**
     * User(Entity) -> UserResponseDto 변환
     */
    private UserResponseDto toUserResponseDto(User user) {
        return UserResponseDto.builder()
                .user_id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .nickname(user.getNickname())
                .birth_date(user.getBirthDate())
                .sex(user.getSex() == null ? null : user.getSex().toString())
                .height(user.getHeight())
                .weight(user.getWeight())
                .degree(user.getDegree() != null ? user.getDegree().doubleValue() : null)
                .introduction(user.getIntroduction())
                .total_weight(user.getTotalWeight() != null ? user.getTotalWeight().doubleValue() : null)
                .deleted(user.getDeleted())
                .strick_attendance(user.getStrickAttendance())
                .last_attendance(user.getLastAttendance())
                .coin(user.getCoin())
                .build();
    }
}
