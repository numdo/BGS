package com.ssafy.bgs.diary.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class DiaryWorkoutRequestDto {
    private Integer workoutId;
    private Integer setSum;
    private List<WorkoutSetRequestDto> sets = new ArrayList<>();
}
