package com.ssafy.bgs.user.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserUpdateRequestDto {
    private String nickname;
    private String introduction;
    private LocalDate birthDate;
    private Double height;
    private Double weight;
}
