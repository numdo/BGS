package com.ssafy.bgs.user.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class KakaoSignupRequestDto {
    private String name;
    private String password;
    private LocalDate birthDate;
    private String sex;
    private Integer height;
    private Integer weight;
}
