package com.ssafy.bgs.auth.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SocialLoginResponseDto {
    private String name;
    private String accessToken;
    private String refreshToken;
    private boolean newUser;
}
