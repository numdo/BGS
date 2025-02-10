package com.ssafy.bgs.diary.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;

@Getter
@Setter
public class WorkoutSetResponseDto {
    private Integer workoutSetId;
    private Integer workoutId;
    private Float weight;
    private Integer repetition;
    private Integer workoutTime;
    private Timestamp createdAt;
    private Timestamp modifiedAt;
}
