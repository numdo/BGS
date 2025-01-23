package com.ssafy.bgs.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordChangeRequestDto {

    @NotBlank(message = "현재 비밀번호는 필수 입력 사항입니다.")
    private String currentPassword;

    @NotBlank(message = "새 비밀번호는 필수 입력 사항입니다.")
    @Size(min = 6, max = 20, message = "새 비밀번호는 6자 이상 20자 이하이어야 합니다.")
    private String newPassword;

    @NotBlank(message = "새 비밀번호 확인은 필수 입력 사항입니다.")
    private String confirmNewPassword;
}
