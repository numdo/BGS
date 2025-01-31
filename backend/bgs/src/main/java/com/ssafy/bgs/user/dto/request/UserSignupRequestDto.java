package com.ssafy.bgs.user.dto.request;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSignupRequestDto {
    private String email;
    private String password;
    private String nickname;
    private String name;
    private LocalDate birthDate;
    private String sex;
    private Integer height;
    private Integer weight;
}
