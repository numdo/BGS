package com.ssafy.bgs.user.dto.response;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class AdminUserResponseDto {
    private Integer userId;
    private String email;
    private String name;
    private String nickname;
    private LocalDate birthDate;
    private String sex;
    private Double height;
    private Double weight;
    private Double degree;
    private String introduction;
    private Double totalWeight;
    private Boolean deleted;
    private Integer strickAttendance;
    private LocalDate lastAttendance;
    private Integer coin;
    private String role;
    private String profileImageUrl;
}