package com.ssafy.bgs.user.dto.response;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class UserResponseDto {
    private Integer user_id;
    private String email;
    private String name;
    private String nickname;
    private LocalDate birth_date;
    private String sex;
    private Integer height;
    private Integer weight;
    private Double degree;
    private String introduction;
    private Double total_weight;
    private Boolean deleted;
    private Integer strick_attendance;
    private LocalDate last_attendance;
    private Integer coin;
}
