package com.ssafy.bgs.auth.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponseDto {
    private String accessToken;
    private boolean isTemporaryPassword;
}