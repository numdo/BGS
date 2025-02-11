package com.ssafy.bgs.routine.dto.response;

import lombok.*;

@Setter
@Getter
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentWorkoutResponseDto {
    private Integer routineWorkoutId;
    private Integer workoutId;
    private String workoutName;
    private String tool;

}
