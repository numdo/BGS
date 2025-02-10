package com.ssafy.bgs.routine.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoutineWorkoutResponseDto {
    private Integer routineWorkoutId;
    private Integer workoutId;
    private Integer routineWorkoutDay;
    private Integer routineWorkoutOrder;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;
    private List<RoutineWorkoutSetResponseDto> sets = new ArrayList<>();

}
