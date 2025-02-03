package com.ssafy.bgs.user.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SocialLoginResponseDto {
    private String accessToken;
    private String refreshToken;
    private boolean newUser;
}
