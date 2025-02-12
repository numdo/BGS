package com.ssafy.bgs.auth.service;

import com.ssafy.bgs.auth.dto.request.SignupRequestDto;
import com.ssafy.bgs.auth.dto.request.SocialSignupRequestDto;
import com.ssafy.bgs.auth.dto.response.LoginResponseDto;
import com.ssafy.bgs.common.DuplicatedException;
import com.ssafy.bgs.auth.dto.response.SocialLoginResponseDto;
import com.ssafy.bgs.common.UnauthorizedAccessException;
import com.ssafy.bgs.redis.service.RedisService;
import com.ssafy.bgs.user.dto.request.PasswordResetRequestDto;
import com.ssafy.bgs.user.dto.response.PasswordResetResponseDto;
import com.ssafy.bgs.user.dto.response.UserResponseDto;
import com.ssafy.bgs.user.entity.AccountType;
import com.ssafy.bgs.user.entity.User;
import com.ssafy.bgs.auth.jwt.JwtTokenProvider;
import com.ssafy.bgs.user.exception.EmailNotFoundException;
import com.ssafy.bgs.user.repository.UserRepository;
import com.ssafy.bgs.user.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    @Value("${kakao.oauth.client-id}")
    private String clientId;


    @Value("${kakao.oauth.redirect-uri}")
    private String redirectUri;

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final RedisService redisService;
    private final EmailService emailService;
    private final VerificationService verificationService;
    private final BCryptPasswordEncoder passwordEncoder;

    /**
     * 카카오 로그인 프로세스:
     * 1) 인가코드로 액세스 토큰 요청
     * 2) 액세스 토큰으로 카카오 사용자 정보 조회
     * 3) DB에 사용자 존재하면 로그인, 없으면 회원가입
     * 4) 로그인 성공 시 JWT 발급
     */
    public SocialLoginResponseDto kakaoLogin(String code) {
        // 1) 인가코드로 카카오 Access Token 가져오기
        String accessToken = getKakaoAccessToken(code);
        if (accessToken == null) {
            throw new RuntimeException("카카오 액세스 토큰 발급 실패");
        }

        // 2) 액세스 토큰으로 사용자 정보 가져오기
        KakaoUserInfo kakaoUserInfo = getKakaoUserInfo(accessToken);
        User user;

        // 3) DB에서 소셜ID로 사용자 조회
        Optional<User> optionalUser = userRepository.findBySocialId(String.valueOf(kakaoUserInfo.id()));
        if (optionalUser.isPresent()) {
            user = optionalUser.get();
        } else {
            // 소셜 ID로 등록된 사용자가 없으면, 이메일 정보가 있다면 이메일 중복 여부도 확인
            if (kakaoUserInfo.email() != null) {
                Optional<User> byEmail = userRepository.findByEmail(kakaoUserInfo.email());
                if (byEmail.isPresent()) {
                    User existingUser = byEmail.get();
                    // 로컬 계정이 존재하면 소셜 로그인 불가 처리
                    if (existingUser.getAccountType() == AccountType.LOCAL) {
                        throw new DuplicatedException("해당 이메일로 로컬 계정이 이미 존재합니다. 로컬 로그인을 사용하세요.");
                    }
                    user = existingUser;
                } else {
                    // 신규 가입 처리: 카카오에서 받아온 정보로 사용자 생성
                    user = createKakaoUser(kakaoUserInfo);
                }
            } else {
                // 이메일 정보가 없는 경우에도 신규 회원가입 진행
                user = createKakaoUser(kakaoUserInfo);
            }
        }

        // 4) 프로필 완성 여부 확인: 필수 정보(닉네임, 이름, 생년월일, 성별, 몸무게)
        boolean profileComplete = (user.getNickname() != null && !user.getNickname().isBlank()) &&
                (user.getName() != null && !user.getName().isBlank()) &&
                (user.getBirthDate() != null) &&
                (user.getSex() != null) &&
                (user.getWeight() != null);

        String token;
        if (profileComplete) {
            token = jwtTokenProvider.createAccessToken(user.getId(),"USER");
        } else {
            token = jwtTokenProvider.createTemporaryAccessToken(user.getId());
        }

        return SocialLoginResponseDto.builder()
                .accessToken(token)
                .build();
    }

    private User createKakaoUser(KakaoUserInfo kakaoUserInfo) {
        User user = new User();
        user.setSocialId(String.valueOf(kakaoUserInfo.id()));
        user.setEmail(kakaoUserInfo.email());
        String nickname = (kakaoUserInfo.nickname() != null && !kakaoUserInfo.nickname().isBlank())
                ? kakaoUserInfo.nickname() : "KakaoUser_" + kakaoUserInfo.id();
        user.setNickname(nickname);
        user.setAccountType(AccountType.KAKAO);
        // 기타 기본값 설정 (필요 시 추가)
        user.setDeleted(false);
        user.setPassword(null);  // 소셜 로그인은 비밀번호를 사용하지 않음
        user.setRole("USER");
        return userRepository.save(user);
    }

    /**
     * 인가코드를 사용해 액세스 토큰 발급
     */
    private String getKakaoAccessToken(String code) {
        try {
            String tokenUrl = "https://kauth.kakao.com/oauth/token";

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("grant_type", "authorization_code");
            params.add("client_id", clientId);
            params.add("redirect_uri", redirectUri);
            params.add("code", code);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            RestTemplate rt = new RestTemplate();
            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(params, headers);

            ResponseEntity<String> response = rt.exchange(tokenUrl, HttpMethod.POST, requestEntity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JSONObject body = new JSONObject(response.getBody());
                return body.getString("access_token");
            } else {
                log.error("카카오 토큰발급 실패: HTTP {}", response.getStatusCode().value());
                return null;
            }
        } catch (Exception e) {
            log.error("카카오 토큰발급 중 예외 발생: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 카카오 액세스 토큰으로 사용자 정보 조회
     */
    private KakaoUserInfo getKakaoUserInfo(String accessToken) {
        try {
            String userInfoUrl = "https://kapi.kakao.com/v2/user/me";

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            RestTemplate rt = new RestTemplate();
            HttpEntity<?> requestEntity = new HttpEntity<>(headers);

            ResponseEntity<String> response = rt.exchange(userInfoUrl, HttpMethod.POST, requestEntity, String.class);
            if (response.getStatusCode() == HttpStatus.OK) {
                JSONObject body = new JSONObject(response.getBody());
                Long id = body.getLong("id");

                JSONObject kakaoAccount = body.optJSONObject("kakao_account");
                String email = null;
                String nickname = null;

                if (kakaoAccount != null) {
                    email = kakaoAccount.optString("email", null);
                    JSONObject profile = kakaoAccount.optJSONObject("profile");
                    if (profile != null) {
                        nickname = profile.optString("nickname", null);
                    }
                }

                return new KakaoUserInfo(id, email, nickname);
            } else {
                log.error("카카오 사용자 정보 조회 실패: HTTP {}", response.getStatusCode().value());
                throw new IllegalArgumentException("카카오 사용자 정보 조회 실패");
            }
        } catch (Exception e) {
            log.error("카카오 사용자 정보 조회 중 예외 발생: {}", e.getMessage());
            throw new IllegalArgumentException("카카오 사용자 정보 조회 실패");
        }
    }

    /**
     * 소셜 회원가입 (추가 정보 입력)
     * - 클라이언트가 추가 정보를 모두 입력하면, 사용자 정보를 업데이트한 후 정식 accessToken을 발급하여 반환합니다.
     */
    public SocialUserResponseDto socialSignup(Integer userId, SocialSignupRequestDto socialSignupRequestDto) {
        // 기존 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        user.setNickname(socialSignupRequestDto.getNickname());

        // 이름, 생년월일, 성별, 키, 몸무게 등 추가 정보 업데이트
        user.setName(socialSignupRequestDto.getName());
        user.setBirthDate(socialSignupRequestDto.getBirthDate());
        if (socialSignupRequestDto.getSex() != null && !socialSignupRequestDto.getSex().isEmpty()) {
            user.setSex(socialSignupRequestDto.getSex().charAt(0));
        }
        user.setHeight(socialSignupRequestDto.getHeight());
        user.setWeight(socialSignupRequestDto.getWeight());

        // 변경 사항 저장
        userRepository.save(user);
        // 정식 accessToken 재발급
        String fullAccessToken = jwtTokenProvider.createAccessToken(user.getId(),"USER");
        String refreshToken = jwtTokenProvider.createReFreshToken(user.getId());

        String redisKey = "user:login:" + user.getId();
        redisService.setValue(redisKey, refreshToken, 1440);
        String cacheKey = "user:info" + userId;
        redisService.deleteValue(cacheKey);

        // 업데이트된 정보를 UserResponseDto에 정식 토큰과 함께 변환하여 반환 (UserResponseDto에 accessToken 필드 추가 필요)
        return SocialUserResponseDto.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .name(user.getName())
                .birthDate(user.getBirthDate())
                .sex(user.getSex() != null ? user.getSex().toString() : null)
                .height(user.getHeight())
                .weight(user.getWeight())
                .accessToken(fullAccessToken)  // 정식 토큰 포함
                .build();
    }


    // 회원가입 (로컬 계정)
    public void signup(SignupRequestDto requestDto) {
        String email = requestDto.getEmail();
        if (!verificationService.isEmailVerified(email)) {
            throw new UnauthorizedAccessException("이메일 인증이 완료되지 않았습니다.");
        }
        if (userRepository.existsByNickname(requestDto.getNickname())) {
            throw new DuplicatedException("이미 사용 중인 닉네임입니다.");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new DuplicatedException("이미 가입된 이메일입니다.");
        }
        String encodedPassword = passwordEncoder.encode(requestDto.getPassword());
        User user = new User();
        user.setEmail(email);
        user.setPassword(encodedPassword);
        user.setNickname(requestDto.getNickname());
        user.setName(requestDto.getName());
        user.setBirthDate(requestDto.getBirthDate());
        if (requestDto.getSex() != null && !requestDto.getSex().isEmpty()) {
            user.setSex(requestDto.getSex().charAt(0));
        }
        user.setHeight(requestDto.getHeight());
        user.setWeight(requestDto.getWeight());
        // 기타 기본값 설정 (예: degree, totalWeight, coin 등)
        user.setAccountType(AccountType.LOCAL);
        userRepository.save(user);

        // 가입 후 이메일 인증 정보 제거
        verificationService.removeVerificationCode(email);
    }

    // 로그인 처리 (로컬 계정)
    public LoginResponseDto login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(EmailNotFoundException::new);
        if (user.getAccountType() != AccountType.LOCAL) {
            throw new IllegalArgumentException("소셜 계정입니다. 소셜 로그인을 사용하세요.");
        }
        boolean isTemporary = false;
        // Redis에서 임시 비밀번호 조회 (key 형식: "user:temp_password:{userId}")
        String redisTempPassword = (String) redisService.getValue("user:temp_password:" + user.getId());
        if (redisTempPassword != null && redisTempPassword.equals(password)) {
            // 입력한 비밀번호가 Redis에 저장된 임시 비밀번호와 일치하면 임시 비밀번호 로그인으로 간주
            isTemporary = true;
        } else {
            // Redis에 임시 비밀번호가 없거나 일치하지 않으면 일반 비밀번호 비교
            if (!passwordEncoder.matches(password, user.getPassword())) {
                throw new IllegalArgumentException("비밀번호가 틀립니다.");
            }
        }
        String role = "USER";
        if (user.getRole() != null && user.getRole().equalsIgnoreCase("ADMIN")) {
            role = "ADMIN";
        }
        String accessToken = jwtTokenProvider.createAccessToken(user.getId(),role);
        String refreshToken = jwtTokenProvider.createReFreshToken(user.getId());

        // Redis에 refresh 토큰 저장 (예: 1440분 동안 유효)
        String redisKey = "user:login:" + user.getId();
        redisService.setValue(redisKey, refreshToken, 1440);

        return LoginResponseDto.builder()
                .accessToken(accessToken)
                .isTemporaryPassword(isTemporary)
                .build();
    }

    public void logout(Integer userId) {
        String redisKey = "user:login:" + userId;
        redisService.deleteValue(redisKey);
        String cacheKey = "user:info" + userId;
        redisService.deleteValue(cacheKey);
    }
    /**
     * 비밀번호 재설정
     */
    public PasswordResetResponseDto resetPassword(PasswordResetRequestDto requestDto) {
        User user = userRepository.findByEmail(requestDto.getEmail())
                .orElseThrow(EmailNotFoundException::new);

        if (user.getAccountType() != AccountType.LOCAL) {
            throw new IllegalArgumentException("로컬 계정만 비밀번호를 재설정할 수 있습니다.");
        }

        // 임시 비밀번호 생성
        String tempPassword = generateTemporaryPassword();
        // 임시 비밀번호를 Redis에 저장 (유효기간: 10분)
        String redisTempKey = "user:temp_password:" + user.getId();
        redisService.setValue(redisTempKey, tempPassword, 10);

         user.setPassword(passwordEncoder.encode(tempPassword));
         userRepository.save(user);

        // 이메일로 임시 비밀번호 전송
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

    // 이메일 인증 코드 전송 및 Redis에 저장
    public String sendVerificationEmail(String email) {
        String code = emailService.sendVerificationEmail(email);
        verificationService.storeVerificationCode(email, code);
        return code;
    }

    // 인증 코드 검증
    public boolean verifyCode(String email, String code) {
        return verificationService.verifyCode(email, code);
    }


    @Transactional(readOnly = true)
    public boolean checkEmail(String email) { return userRepository.findByEmail(email).isEmpty(); }
    /**
     * 카카오 사용자 정보 DTO(내부 용도)
     */
    private record KakaoUserInfo(Long id, String email, String nickname) {}

}
