package com.ssafy.bgs.gym.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MachineResponseDto {
    private Integer machineId;
    private String machineName;
    private LocalDateTime createdAt;
}
