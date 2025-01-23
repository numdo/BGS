package com.ssafy.bgs.gym.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class GymResponseDto {
    private Integer gymId;
    private String gymName;
    private String gymAddress;
    private LocalDateTime createdAt;
    private Boolean deleted;
}
