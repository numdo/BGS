package com.ssafy.bgs.user.service;


import com.ssafy.bgs.auth.service.VerificationService;
import com.ssafy.bgs.common.DuplicatedException;
import com.ssafy.bgs.image.dto.response.ImageResponseDto;
import com.ssafy.bgs.image.entity.Image;
import com.ssafy.bgs.image.service.ImageService;
import com.ssafy.bgs.redis.service.RedisService;
import com.ssafy.bgs.user.dto.request.*;
import com.ssafy.bgs.user.dto.response.InfoResponseDto;
import com.ssafy.bgs.user.dto.response.UserResponseDto;
import com.ssafy.bgs.user.entity.AccountType;
import com.ssafy.bgs.user.entity.Following;
import com.ssafy.bgs.user.entity.FollowingId;
import com.ssafy.bgs.user.entity.User;
import com.ssafy.bgs.user.exception.FollowingNotFoundException;
import com.ssafy.bgs.user.exception.UserNotFoundException;
import com.ssafy.bgs.auth.jwt.JwtTokenProvider;
import com.ssafy.bgs.user.repository.FollowingRepository;
import com.ssafy.bgs.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
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
    private final RedisService redisService;
    private final VerificationService verificationService;

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
     * 내 정보 조회
     */
    @Transactional(readOnly = true)
    public UserResponseDto getUserInfo(Integer userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        // 1) 기본 유저 정보 DTO 생성
        UserResponseDto dto = toUserResponseDto(user);

        String redisKey = "user:info:" + user.getId();
        redisService.setValue(redisKey, dto, 60);

        // 2) 가장 최신 프로필 이미지를 조회하여 dto에 세팅
        imageService.findLatestProfileImage(userId)
                .ifPresent(image -> dto.setProfileImageUrl(imageService.getS3Url(image.getUrl())));

        return dto;
    }

    @Transactional(readOnly = true)
    public InfoResponseDto getInfo(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));

        InfoResponseDto dto = toInfoResponseDto(user);

        imageService.findLatestProfileImage(userId)
                .ifPresent(image -> dto.setProfileImageUrl(imageService.getS3Url(image.getUrl())));
        return dto;
    }

    /**
     * 회원 이미지 변경
     * @param userId
     * @param newProfileImage
     * @return
     */
    @Transactional
    public UserResponseDto updateProfileImage(Integer userId, MultipartFile newProfileImage) {
        // 1. 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        // 2. 기존 프로필 이미지 조회 및 삭제
        Optional<Image> currentImageOpt = imageService.findLatestProfileImage(userId);
        if (currentImageOpt.isPresent()) {
            // 기존 이미지 삭제 (필요시 이미지 동일 여부 비교 로직 추가 가능)
            imageService.deleteImage(currentImageOpt.get().getImageId());
        }

        // 3. 단일 이미지 업로드 (usageType='profile')
        // 기존에는 List를 생성하여 업로드하였지만, 단일 업로드 메서드로 대체
        Image newImage = imageService.uploadImage(newProfileImage, "profile", (long) userId);

        // 4. Redis 캐시 무효화
        String cacheKey = "user:" + userId;
        redisService.deleteValue(cacheKey);

        // 5. 최신 프로필 이미지로 갱신하여 사용자 정보 조회
        User updatedUser = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        UserResponseDto dto = toUserResponseDto(updatedUser);
        imageService.findLatestProfileImage(userId)
                .ifPresent(img -> dto.setProfileImageUrl(imageService.getS3Url(img.getUrl())));

        return dto;
    }



    /**
     * 특정 사용자 정보 수정 + (옵션) 프로필 이미지 업로드
     */
    @Transactional
    public UserResponseDto updateUserInfo(Integer userId,
                                          UserUpdateRequestDto requestDto) {
        // 1) 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        // 2) 닉네임 중복 체크 (기존 로직)
        String newNickname = requestDto.getNickname();
        if (newNickname != null && !newNickname.equals(user.getNickname())) {
            if (userRepository.existsByNickname(newNickname)) {
                throw new DuplicatedException("이미 사용 중인 닉네임입니다.");
            }
            user.setNickname(newNickname);
        }

        // 3) 다른 정보 변경
        user.setIntroduction(requestDto.getIntroduction());
        user.setBirthDate(requestDto.getBirthDate());
        user.setHeight(requestDto.getHeight());
        user.setWeight(requestDto.getWeight());

        // 5) DB 반영
        User updatedUser = userRepository.save(user);


        String cacheKey = "user:info" + userId;
        redisService.deleteValue(cacheKey);

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
        userRepository.delete(user);
    }


    /**
     * 비밀번호 변경
     */
    public void changePassword(Integer userId, PasswordChangeRequestDto requestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        // 1. ACCOUNT_TYPE이 LOCAL인지 확인
        if (user.getAccountType() != AccountType.LOCAL) {
            throw new IllegalArgumentException("로컬 계정만 비밀번호를 변경할 수 있습니다.");
        }

        // 2. 현재 비밀번호 확인
        if (!passwordEncoder.matches(requestDto.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        // 3. 새 비밀번호와 확인 비밀번호 일치 여부 확인
        if (!requestDto.getNewPassword().equals(requestDto.getConfirmNewPassword())) {
            throw new IllegalArgumentException("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
        }

        // 4. 새 비밀번호 암호화 및 저장
        String encodedNewPassword = passwordEncoder.encode(requestDto.getNewPassword());
        user.setPassword(encodedNewPassword);
        userRepository.save(user);

        redisService.deleteValue("user:" + userId);

    }



    /**
     * 팔로잉 (followerId -> followeeId)
     */
    public void followUser(Integer followerId, Integer followeeId) {
        FollowingId id = new FollowingId(followerId, followeeId);

        if (followingRepository.findById(id).isPresent()) {
            throw new DuplicatedException("이미 팔로우 중입니다.");
        }

        userRepository.findById(followeeId)
                .orElseThrow(() -> new UserNotFoundException(followeeId));
        userRepository.findById(followerId)
                .orElseThrow(() -> new UserNotFoundException(followerId));

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
                .orElseThrow(() -> new FollowingNotFoundException("팔로잉 관계가 없습니다."));
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
                .peek(followee -> {
                    ImageResponseDto image = imageService.getImage("profile", followee.getUserId());
                    if (image != null)
                        followee.setProfileImageUrl(imageService.getS3Url(image.getUrl()));
                })
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
                .peek(followee -> {
                    ImageResponseDto image = imageService.getImage("profile", followee.getUserId());
                    if (image != null)
                        followee.setProfileImageUrl(imageService.getS3Url(image.getUrl()));
                })
                .collect(Collectors.toList()); // toList() 대신 collect(Collectors.toList()) 사용
    }
    @Transactional(readOnly = true)
    public boolean checkNickname(String nickname, String currentNickname) {
        // 본인이 사용 중인 닉네임이면 중복체크를 하지 않고 사용 가능 처리
        if(nickname.equals(currentNickname)) {
            return true;
        }
        return !userRepository.existsByNickname(nickname);
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
                .accountType(user.getAccountType())
                .role(user.getRole())
                .profileImageUrl(null) // 여기서는 기본 null로 두고, 호출부에서 최신 이미지를 세팅
                .build();
    }

    private InfoResponseDto toInfoResponseDto(User user) {
        return InfoResponseDto.builder()
                .userId(user.getId())
                .nickname(user.getNickname())
                .introduce(user.getIntroduction())
                .profileImageUrl(null)
                .build();
    }
}
