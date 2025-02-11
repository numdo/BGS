package com.ssafy.bgs.user.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class AdminUpdateUserRequestDto {
    private String nickname;
    private String email;
    private String role;
}
