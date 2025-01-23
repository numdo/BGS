package com.ssafy.bgs.user.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PasswordResetResponseDto {
    private String message;
}
