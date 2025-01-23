package com.ssafy.bgs.diary.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkoutSetRequestDto {
    private Integer workoutSetId;
    private Float weight;
    private Integer repetition;
    private Integer workoutTime;
    private Integer ordinal;
    private Boolean deleted;
}
