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
    private LocalDate birth_date;
    private Integer height;
    private Integer weight;
}
