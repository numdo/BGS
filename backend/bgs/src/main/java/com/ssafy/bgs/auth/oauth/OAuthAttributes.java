package com.ssafy.bgs.auth.oauth;

import java.util.Map;
import lombok.Builder;
import lombok.Getter;

@Getter
public class OAuthAttributes {

    private Map<String, Object> attributes;
    // 구글에서는 사용자 식별 키가 "sub"로 넘어옵니다.
    private String nameAttributeKey;
    private String name;
    private String email;
    private Map<String, Object> kakaoAccount;
    private String newUser;

    @Builder
    public OAuthAttributes(Map<String, Object> attributes, String nameAttributeKey,
                           String name, String email, String newUser) {
        this.attributes = attributes;
        this.nameAttributeKey = nameAttributeKey;
        this.name = name;
        this.email = email;
        this.newUser = newUser;
    }

    // registrationId에 따라 분기할 수 있으나, 현재는 구글만 사용하므로 ofGoogle() 호출
    public static OAuthAttributes of(String registrationId, String userNameAttributeName, Map<String, Object> attributes) {
        return ofGoogle(userNameAttributeName, attributes);
    }

    private static OAuthAttributes ofGoogle(String userNameAttributeName, Map<String, Object> attributes) {
        return OAuthAttributes.builder()
                .name((String) attributes.get("name"))
                .email((String) attributes.get("email"))
                .attributes(attributes)
                .nameAttributeKey(userNameAttributeName)  // 일반적으로 "sub" 값이 전달됨
                .build();
    }


}
