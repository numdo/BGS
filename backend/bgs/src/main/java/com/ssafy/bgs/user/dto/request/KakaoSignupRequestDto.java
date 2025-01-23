package com.ssafy.bgs.user.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
public class KakaoSignupRequestDto {
    private String name;
    private String nickname;
    private LocalDate birthDate;
    private String sex;
    private Integer height;
    private Integer weight;
}
