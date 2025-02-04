package com.ssafy.bgs.auth.service;

import com.ssafy.bgs.common.DuplicatedException;
import com.ssafy.bgs.auth.dto.response.SocialLoginResponseDto;
import com.ssafy.bgs.user.entity.AccountType;
import com.ssafy.bgs.user.entity.User;
import com.ssafy.bgs.auth.jwt.JwtTokenProvider;
import com.ssafy.bgs.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

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
        boolean isNewUser = false;
        // 3) DB에 기존 사용자가 있는지 확인 (kakaoId로 조회)
        Optional<User> optionalUser = userRepository.findBySocialId(String.valueOf(kakaoUserInfo.id()));
        User user;
        if (optionalUser.isPresent()) {
            // 이미 가입된 카카오 사용자
            user = optionalUser.get();
        } else {
            // 가입된 사용자가 없으면 email 중복 여부 확인
            if (kakaoUserInfo.email() != null) {
                Optional<User> byEmail = userRepository.findByEmail(kakaoUserInfo.email());
                if (byEmail.isPresent()) {
                    User existingUser = byEmail.get();
                    if (existingUser.getAccountType() == AccountType.LOCAL) {
                        throw new DuplicatedException("해당 이메일로 로컬 계정이 이미 존재합니다. 로컬 로그인을 사용하세요.");
                    }
                    user = existingUser;

                } else {
                    // 신규 가입 처리
                    isNewUser = true;
                    user = new User();
                    user.setSocialId(String.valueOf(kakaoUserInfo.id()));
                    user.setEmail(kakaoUserInfo.email());
                    user.setNickname(
                            (kakaoUserInfo.nickname() != null && !kakaoUserInfo.nickname().isBlank())
                                    ? kakaoUserInfo.nickname()
                                    : "KakaoUser_" + kakaoUserInfo.id()
                    );
                    // 필요 시 default값 설정
                    user.setAccountType(AccountType.KAKAO);
                    user.setDegree(null);
                    user.setDeleted(false);
                    user.setPassword(null); // 소셜 로그인시 패스워드는 null 처리
                    userRepository.save(user);
                }
            } else {
                // 이메일 정보를 받아오지 못했을 경우 -> 닉네임이나 kakaoId로 가입 처리
                user = new User();
                user.setSocialId(String.valueOf(kakaoUserInfo.id()));
                userRepository.save(user);
            }
        }

        // 4) JWT 발급
        String accessJwt = jwtTokenProvider.createAccessToken(user.getId());
        String refreshJwt = jwtTokenProvider.createReFreshToken(user.getId());

        return SocialLoginResponseDto.builder()
                .accessToken(accessJwt)
                .refreshToken(refreshJwt)
                .newUser(isNewUser)
                .build();
    }

    /**
     * 인가코드를 사용해 액세스 토큰 발급
     */
    private String getKakaoAccessToken(String code) {
        try {
            String tokenUrl = "https://kauth.kakao.com/oauth/token";

            // 카카오 서버로 요청하기 위한 파라미터
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("grant_type", "authorization_code");
            params.add("client_id", clientId);
            params.add("redirect_uri", redirectUri);
            params.add("code", code);


            // 헤더
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            // 요청
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

                // kakao_account 내용 파싱
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
     * 카카오 사용자 정보 DTO(내부 용도)
     */
    private record KakaoUserInfo(Long id, String email, String nickname) {}
}
