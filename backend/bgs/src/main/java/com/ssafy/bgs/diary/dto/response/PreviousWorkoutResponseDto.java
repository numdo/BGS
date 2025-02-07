package com.ssafy.bgs.diary.dto.response;

import lombok.Getter;
import lombok.Setter;
import java.sql.Date;

@Getter
@Setter
public class PreviousWorkoutResponseDto {
    // DiaryWorkout의 고유 ID (예: diaryWorkoutId)
    private Integer diaryWorkoutId;
    // 운동 식별 ID (추가)
    private Integer workoutId;
    // 운동 날짜
    private Date workoutDate;
    // 운동 이름
    private String workoutName;
    // 운동 부위
    private String part;
}
