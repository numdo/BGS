package com.ssafy.bgs.user.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponseDto {
    private Integer userId;
    private String accessToken;
    private String refreshToken;
}