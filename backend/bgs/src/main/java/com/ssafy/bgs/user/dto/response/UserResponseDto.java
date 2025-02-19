package com.ssafy.bgs.user.dto.response;

import com.ssafy.bgs.user.entity.AccountType;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class UserResponseDto {
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
    private AccountType accountType;
    private String role;
}
