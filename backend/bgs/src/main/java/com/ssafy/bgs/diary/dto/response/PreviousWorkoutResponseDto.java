package com.ssafy.bgs.diary.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.sql.Date;
import java.util.List;

@Getter
@Setter
public class PreviousWorkoutResponseDto {
    private Integer diaryId;

    // 하나의 다이어리에 있는 여러 DiaryWorkout 중 대표 ID(예: 첫 번째 항목)
    private Integer diaryWorkoutId;

    // 운동 날짜
    private Date workoutDate;

    // 여러 운동 묶음
    // 예: [10, 11]
    private List<Integer> workoutIds;
    // 예: "벤치프레스, 데드리프트"
    private String workoutName;
    // 예: "가슴, 등"
    private String part;
    // 예: "바벨, 바벨" (기구 명)
    private String tool;

    // 이 다이어리에 포함된 모든 운동세트(각 세트별로 workoutId를 붙여서 구분)
    private List<WorkoutSetResponseDto> sets;

    // 필요시 쓸 수도 있는 통계 정보(평균 무게/횟수 등)
    private Float weight;
    private Integer repetition;
    private Integer workoutTime;
}
