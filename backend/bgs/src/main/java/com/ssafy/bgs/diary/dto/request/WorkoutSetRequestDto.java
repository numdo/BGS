package com.ssafy.bgs.diary.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkoutSetRequestDto {
    private Float weight;
    private Integer repetition;
    private Integer workoutTime;
    private Integer ordinal;
}
