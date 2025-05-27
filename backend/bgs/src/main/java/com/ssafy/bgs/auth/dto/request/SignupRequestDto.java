package com.ssafy.bgs.auth.dto.request;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignupRequestDto {
    private String email;
    private String password;
    private String nickname;
    private String name;
    private LocalDate birthDate;
    private String sex;
    private Double height;
    private Double weight;
}
