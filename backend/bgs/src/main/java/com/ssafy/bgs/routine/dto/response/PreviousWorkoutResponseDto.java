package com.ssafy.bgs.routine.dto.response;

import lombok.*;

import java.sql.Date;
import java.util.List;

@Setter
@Getter
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PreviousWorkoutResponseDto {
    private Integer routineId;
    private Integer routineWorkoutId;
    private Date routineDate;
    private List<Integer> workoutIds;
    private String workoutName; // 여러 운동명을 쉼표(,)로 연결한 값
    private String part;        // 운동 부위 정보 (연결된 문자열)
    private String tool;        // 운동 기구 정보 (연결된 문자열)
    private List<RoutineWorkoutSetResponseDto> sets;
    private Double weight;      // 평균/합산 무게 (필요시)
    private Integer repetition; // 평균/합산 반복 수 (필요시)
    private Integer workoutTime;// 평균/합산 운동 시간 (필요시)

}
