package com.ssafy.bgs.diary.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class DiaryWorkoutResponseDto {
    private Integer diaryWorkoutId;
    private Integer workoutId;
    private Timestamp createdAt;
    private Timestamp modifiedAt;
    private List<WorkoutSetResponseDto> sets = new ArrayList<>();
}
