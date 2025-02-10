package com.ssafy.bgs.routine.dto.request;

import lombok.*;

import java.util.List;

@Setter
@Getter
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoutineWorkoutRequestDto {
    private Integer routineWorkoutId; // 수정 시 사용 (신규 등록 시 null)
    private Integer workoutId;
    private Integer routineWorkoutDay;     // 예: Day 번호 (1, 2, …)
    private Integer routineWorkoutOrder;   // 해당 Day 내 운동 순서
    private Boolean deleted;               // 수정 시 삭제 여부 처리 (null 또는 false이면 미삭제)
    private List<RoutineWorkoutSetRequestDto> sets;


}
