package com.ssafy.bgs.user.service;


import com.ssafy.bgs.image.service.ImageService;
import com.ssafy.bgs.user.dto.request.*;
import com.ssafy.bgs.user.dto.response.LoginResponseDto;
import com.ssafy.bgs.user.dto.response.PasswordResetResponseDto;
import com.ssafy.bgs.user.dto.response.UserResponseDto;
import com.ssafy.bgs.user.entity.AccountType;
import com.ssafy.bgs.user.entity.Following;
import com.ssafy.bgs.user.entity.FollowingId;
import com.ssafy.bgs.user.entity.User;
import com.ssafy.bgs.user.jwt.JwtTokenProvider;
import com.ssafy.bgs.user.repository.FollowingRepository;
import com.ssafy.bgs.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final FollowingRepository followingRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;
    private final ImageService imageService;

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
        user.setBirthDate(requestDto.getBirthDate());
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
        user.setAccountType(AccountType.LOCAL);

        // 5. 저장
        User savedUser = userRepository.save(user);

        // 6. 응답 DTO 변환
        return toUserResponseDto(savedUser);
    }
    public UserResponseDto kakaoSignup(Integer userId, KakaoSignupRequestDto kakaoSignupRequestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        user.setName(kakaoSignupRequestDto.getName());
        // 로컬 로그인을 허용한다면, 비밀번호 저장 (BCrypt)

        if (userRepository.existsByNickname(kakaoSignupRequestDto.getNickname())) {
            throw new RuntimeException("이미 사용 중인 닉네임입니다.");
        }
        user.setNickname(kakaoSignupRequestDto.getNickname());

        if (kakaoSignupRequestDto.getBirthDate() != null) {
            user.setBirthDate(kakaoSignupRequestDto.getBirthDate());
        }

        if (kakaoSignupRequestDto.getSex() != null && kakaoSignupRequestDto.getSex().length() > 0) {
            user.setSex(kakaoSignupRequestDto.getSex().charAt(0));  // DB는 Character
        }

        if (kakaoSignupRequestDto.getHeight() != null) {
            user.setHeight(kakaoSignupRequestDto.getHeight());
        }

        if (kakaoSignupRequestDto.getWeight() != null) {
            user.setWeight(kakaoSignupRequestDto.getWeight());
        }

        // 4) 저장
        User updatedUser = userRepository.save(user);

        // 5) 응답 DTO 변환
        return toUserResponseDto(updatedUser);
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

    /**
     * 로그인
     * @param email
     * @param password
     * @return
     */
    public LoginResponseDto login(String email, String password) {
        // 1. 이메일로 사용자를 조회
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("해당 이메일이 존재하지 않습니다."));


        // 2. 계정 유형 확인
        if (user.getAccountType() == AccountType.KAKAO) {
            throw new RuntimeException("소셜 계정입니다. 소셜 로그인을 사용하세요.");
        }

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

    /**
     * 로그아웃
     * @param userId
     */
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

        // 1) 기본 유저 정보 DTO 생성
        UserResponseDto dto = toUserResponseDto(user);

        // 2) 가장 최신 프로필 이미지를 조회하여 dto에 세팅
        imageService.findLatestProfileImage(userId)
                .ifPresent(image -> dto.setProfileImageUrl(imageService.getS3Url(image.getUrl())));


        return dto;
    }


    /**
     * 특정 사용자 정보 수정 + (옵션) 프로필 이미지 업로드
     */
    @Transactional
    public UserResponseDto updateUserInfo(Integer userId,
                                          UserUpdateRequestDto requestDto,
                                          MultipartFile profileImage) {
        // 1) 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 2) 닉네임 중복 체크 (기존 로직)
        String newNickname = requestDto.getNickname();
        if (newNickname != null && !newNickname.equals(user.getNickname())) {
            if (userRepository.existsByNickname(newNickname)) {
                throw new RuntimeException("이미 사용 중인 닉네임입니다.");
            }
            user.setNickname(newNickname);
        }

        // 3) 다른 정보 변경
        user.setIntroduction(requestDto.getIntroduction());
        user.setBirthDate(requestDto.getBirthDate());
        user.setHeight(requestDto.getHeight());
        user.setWeight(requestDto.getWeight());

        // 4) 프로필 이미지가 있으면 업로드
        if (profileImage != null && !profileImage.isEmpty()) {
            try {
                // ImageService를 통해 S3 업로드 + images 테이블 INSERT
                // usage_type='PROFILE', usage_id=userId
                imageService.uploadProfileImage(profileImage, userId);
            } catch (IOException e) {
                // IOException -> RuntimeException 래핑
                throw new RuntimeException("파일 업로드 중 오류가 발생했습니다.", e);
            }
        }

        // 5) DB 반영
        User updatedUser = userRepository.save(user);

        // 6) 엔티티 -> DTO 변환
        UserResponseDto dto = toUserResponseDto(updatedUser);

        imageService.findLatestProfileImage(userId)
                .ifPresent(img -> dto.setProfileImageUrl(imageService.getS3Url(img.getUrl())));


        return dto;
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
        user.setSocialId(null);
        user.setAccountType(null);
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
     * 비밀번호 변경
     */
    public void changePassword(Integer userId, PasswordChangeRequestDto requestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        // 1. ACCOUNT_TYPE이 LOCAL인지 확인
        if (user.getAccountType() != AccountType.LOCAL) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "로컬 계정만 비밀번호를 변경할 수 있습니다.");
        }

        // 2. 현재 비밀번호 확인
        if (!passwordEncoder.matches(requestDto.getCurrentPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "현재 비밀번호가 일치하지 않습니다.");
        }

        // 3. 새 비밀번호와 확인 비밀번호 일치 여부 확인
        if (!requestDto.getNewPassword().equals(requestDto.getConfirmNewPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
        }

        // 4. 새 비밀번호 암호화 및 저장
        String encodedNewPassword = passwordEncoder.encode(requestDto.getNewPassword());
        user.setPassword(encodedNewPassword);
        userRepository.save(user);
    }

    /**
     * 비밀번호 재설정
     */
    public PasswordResetResponseDto resetPassword(PasswordResetRequestDto requestDto) {
        User user = userRepository.findByEmail(requestDto.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "해당 이메일을 사용하는 사용자가 없습니다."));

        // 1. ACCOUNT_TYPE이 LOCAL인지 확인
        if (user.getAccountType() != AccountType.LOCAL) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "로컬 계정만 비밀번호를 재설정할 수 있습니다.");
        }

        // 2. 임시 비밀번호 생성
        String tempPassword = generateTemporaryPassword();

        // 3. 임시 비밀번호 암호화 및 저장
        String encodedTempPassword = passwordEncoder.encode(tempPassword);
        user.setPassword(encodedTempPassword);
        userRepository.save(user);

        // 4. 이메일로 임시 비밀번호 전송
        emailService.sendTemporaryPasswordEmail(user.getEmail(), tempPassword);

        return PasswordResetResponseDto.builder()
                .message("임시 비밀번호가 이메일로 전송되었습니다.")
                .build();
    }

    /**
     * 임시 비밀번호 생성
     */
    private String generateTemporaryPassword() {
        int length = 8;
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_";
        StringBuilder tempPassword = new StringBuilder();
        Random random = new Random();
        for(int i = 0; i < length; i++) {
            tempPassword.append(chars.charAt(random.nextInt(chars.length())));
        }
        return tempPassword.toString();
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
    public void followUser(Integer followerId, Integer followeeId) {
        FollowingId id = new FollowingId(followerId, followeeId);

        if (followingRepository.findById(id).isPresent()) {
            throw new RuntimeException("이미 팔로우 중입니다.");
        }

        userRepository.findById(followeeId)
                .orElseThrow(() -> new RuntimeException("팔로우 대상 사용자를 찾을 수 없습니다."));
        userRepository.findById(followerId)
                .orElseThrow(() -> new RuntimeException("팔로우를 거는 사용자를 찾을 수 없습니다."));

        Following following = Following.builder()
                .id(id) // FollowingId 객체 설정
                .build();
        followingRepository.save(following);
    }
    /**
     * 언팔로잉
     */
    public void unfollowUser(Integer followerId, Integer followeeId) {
        FollowingId id = new FollowingId(followerId, followeeId);

        Following relation = followingRepository.findById(id)
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

        // followeeId 목록 추출
        List<Integer> followeeIds = followings.stream()
                .map(following -> following.getId().getFolloweeId())
                .toList();

        // 한 번의 쿼리로 followee 정보 조회
        List<User> followees = userRepository.findAllById(followeeIds);

        return followees.stream()
                .filter(u -> u != null && (u.getDeleted() == null || !u.getDeleted()))
                .filter(u -> nicknameFilter == null || u.getNickname().contains(nicknameFilter))
                .map(this::toUserResponseDto)
                .collect(Collectors.toList()); // toList() 대신 collect(Collectors.toList()) 사용
    }

    /**
     * 팔로워 목록 조회
     * - userId를 팔로우하는 사람들(=followerId들) 조회
     */
    @Transactional(readOnly = true)
    public List<UserResponseDto> getFollowerList(Integer userId, String nicknameFilter) {
        List<Following> followers = followingRepository.findByFolloweeId(userId);

        // followerId 목록 추출
        List<Integer> followerIds = followers.stream()
                .map(following -> following.getId().getFollowerId())
                .toList();

        // 한 번의 쿼리로 follower 정보 조회
        List<User> followersUsers = userRepository.findAllById(followerIds);

        return followersUsers.stream()
                .filter(u -> u != null && (u.getDeleted() == null || !u.getDeleted()))
                .filter(u -> nicknameFilter == null || u.getNickname().contains(nicknameFilter))
                .map(this::toUserResponseDto)
                .collect(Collectors.toList()); // toList() 대신 collect(Collectors.toList()) 사용
    }

    /**
     * User(Entity) -> UserResponseDto 변환
     */
    private UserResponseDto toUserResponseDto(User user) {
        return UserResponseDto.builder()
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
                .profileImageUrl(null) // 여기서는 기본 null로 두고, 호출부에서 최신 이미지를 세팅
                .build();
    }
}
