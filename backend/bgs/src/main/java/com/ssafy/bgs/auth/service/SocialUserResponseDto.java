package com.ssafy.bgs.auth.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialUserResponseDto {
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
    private String profileImageUrl;
    private String accessToken;
}
