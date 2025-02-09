package com.ssafy.bgs.auth.dto.request;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor  // 기본 생성자 추가
@AllArgsConstructor // 모든 필드를 받는 생성자 추가 (옵션)
public class SocialSignupRequestDto {
    private String name;
    private String nickname;
    private LocalDate birthDate;
    private String sex;
    private Integer height;
    private Integer weight;
}
