package com.ssafy.bgs.user.dto.request;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdateRequestDto {
    private String nickname;
    private String introduction;
    private LocalDate birthDate;
    private Double height;
    private Double weight;
}
