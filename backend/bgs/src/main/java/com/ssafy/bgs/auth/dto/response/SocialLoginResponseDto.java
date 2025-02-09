package com.ssafy.bgs.auth.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SocialLoginResponseDto {
    private boolean newUser; // 신규 회원 여부
    private String accessToken;
}
