package com.ssafy.bgs.user.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminResetPasswordRequestDto {
    // 새 비밀번호
    private String newPassword;
}
