package com.ssafy.bgs.routine.dto.request;

import lombok.*;

import java.math.BigDecimal;

@Setter
@Getter
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoutineWorkoutSetRequestDto {
    private Integer workoutSetId; // 수정 시 사용 (신규 등록 시 null)
    private BigDecimal weight;
    private Integer repetition;
    private Integer workoutTime; // 운동 시간 (초)
    private Boolean deleted;     // 수정 시 삭제 여부 처리

}
