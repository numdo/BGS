package com.ssafy.bgs.auth.service;

import com.ssafy.bgs.auth.oauth.OAuthAttributes;
import com.ssafy.bgs.auth.oauth.SessionUser;
import com.ssafy.bgs.common.DuplicatedException;
import com.ssafy.bgs.user.entity.AccountType;
import com.ssafy.bgs.user.entity.User;
import com.ssafy.bgs.user.repository.UserRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpSession;
import java.util.Collections;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepository;
    private final HttpSession httpSession;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // 기본 제공 DefaultOAuth2UserService를 통해 사용자 정보를 로드
        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
        OAuth2User oAuth2User = delegate.loadUser(userRequest);

        // 현재 로그인 진행 중인 제공자 (예: "google")
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        // 구글의 경우 사용자 식별 키는 "sub"입니다.
        String userNameAttributeName = userRequest.getClientRegistration()
                .getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();

        // OAuthAttributes를 통해 JSON 데이터를 DTO로 변환
        OAuthAttributes attributes = OAuthAttributes.of(registrationId, userNameAttributeName, oAuth2User.getAttributes());

        // DB에 사용자 정보 저장 또는 업데이트하고, 신규 가입 여부를 판단
        SaveResult result = saveOrUpdate(attributes);

        // 세션에 신규 가입 여부와 사용자 정보를 저장
        httpSession.setAttribute("newUser", result.isNew());
        httpSession.setAttribute("user", new SessionUser(result.user()));
        log.info("Session user set: {}", httpSession.getAttribute("user"));
        log.info("Session newUser set: {}", httpSession.getAttribute("newUser"));

        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority(result.user().getAccountType().toString())),
                attributes.getAttributes(),
                attributes.getNameAttributeKey()
        );
    }

    /**
     * 사용자 정보 저장 또는 업데이트 후, 신규 가입 여부를 포함한 SaveResult를 반환합니다.
     */
    private SaveResult saveOrUpdate(OAuthAttributes attributes) {
        // 구글의 경우, "sub" 값이 구글 고유 ID입니다.
        String socialId = attributes.getAttributes().get("sub").toString();
        boolean isNewUser = false;

        // 이메일 기준으로 기존 사용자 조회
        Optional<User> optionalUser = userRepository.findByEmail(attributes.getEmail());
        User user;
        if (optionalUser.isPresent()) {
            user = optionalUser.get();
            user.setName(null);
            // 기존 사용자라면, socialId가 없는 경우 업데이트
            if (user.getSocialId() == null) {
                user.setSocialId(socialId);
            }
            user = userRepository.save(user);
        } else {
            // 이메일 정보가 있는 경우, 추가 중복 체크
            if (attributes.getEmail() != null) {
                Optional<User> byEmail = userRepository.findByEmail(attributes.getEmail());
                if (byEmail.isPresent()) {
                    User existingUser = byEmail.get();
                    if (existingUser.getAccountType() == AccountType.LOCAL) {
                        throw new DuplicatedException("해당 이메일로 로컬 계정이 이미 존재합니다. 로컬 로그인을 사용하세요.");
                    }
                    else if (existingUser.getAccountType() == AccountType.KAKAO) {
                        throw new DuplicatedException("해당 이메일로 카카오 계정이 이미 존재합니다. 카카오 로그인을 사용하세요.");
                    }
                    else if (existingUser.getAccountType() == AccountType.GOOGLE) {
                        if (existingUser.getSocialId() == null) {
                            existingUser.setSocialId(socialId);
                        }
                    }
//                    existingUser.setName(attributes.getName());
                    user = userRepository.save(existingUser);
                } else {
                    isNewUser = true;
                    User newUser = new User();
                    newUser.setName(null);
                    newUser.setEmail(attributes.getEmail());
                    newUser.setSocialId(socialId);
                    newUser.setAccountType(AccountType.GOOGLE);
                    newUser.setNickname(attributes.getName());
                    user = userRepository.save(newUser);
                }
            } else {
                // 이메일 정보가 없는 경우
                isNewUser = true;
                User newUser = new User();
                newUser.setSocialId(socialId);
                newUser.setAccountType(AccountType.GOOGLE);
                user = userRepository.save(newUser);
            }
        }
        user.setId(user.getId());
        return new SaveResult(user, isNewUser);
    }

    private record SaveResult(User user, boolean isNew) {
    }
}
