package com.ssafy.bgs.gym.dto.response;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class GymLocationResponseDto {
    private Integer gymId;
    private String gymName;
    private String gymAddress;
    private Double latitude;
    private Double longitude;
    private Double distance;
}
