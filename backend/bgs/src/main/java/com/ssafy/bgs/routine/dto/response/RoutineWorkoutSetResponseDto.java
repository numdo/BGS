package com.ssafy.bgs.routine.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Setter
@Getter
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoutineWorkoutSetResponseDto {
    private Integer workoutSetId;
    private Integer workoutId;
    private BigDecimal weight;
    private Integer repetition;
    private Integer workoutTime;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;

}
