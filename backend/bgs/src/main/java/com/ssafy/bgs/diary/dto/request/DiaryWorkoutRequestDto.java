package com.ssafy.bgs.diary.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class DiaryWorkoutRequestDto {
    private Integer diaryWorkoutId;
    private Integer workoutId;
    private Boolean deleted;
    private List<WorkoutSetRequestDto> sets = new ArrayList<>();
}
