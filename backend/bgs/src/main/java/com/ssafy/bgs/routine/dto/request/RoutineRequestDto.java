package com.ssafy.bgs.routine.dto.request;

import lombok.*;

import java.util.List;

@Setter
@Getter
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoutineRequestDto {
    private Integer routineId; // 수정 시 사용 (신규 등록 시 null)
    private Integer userId;
    private String routineName;
    private List<RoutineWorkoutRequestDto> routineWorkouts;

}
