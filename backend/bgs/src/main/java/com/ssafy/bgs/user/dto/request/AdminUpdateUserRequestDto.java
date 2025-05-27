package com.ssafy.bgs.user.dto.request;

import lombok.*;
import lombok.experimental.Accessors;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor  // 기본 생성자 추가
@Builder
public class AdminUpdateUserRequestDto {
    private String nickname;
    private String email;
    private String role;
}
