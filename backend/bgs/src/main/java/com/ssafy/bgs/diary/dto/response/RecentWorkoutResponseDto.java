package com.ssafy.bgs.diary.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RecentWorkoutResponseDto {
    // DiaryWorkout의 고유 ID (예: diaryWorkoutId)
    private Integer diaryWorkoutId;
    // 운동 식별 ID (추가)
    private Integer workoutId;
    // 운동 이름
    private String workoutName;
    private String tool;
}
