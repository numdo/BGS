package com.ssafy.bgs.diary.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class DiaryCreateDto {
    private Integer userId;
    private String content;
    private Date workoutDate;
    private String allowedScope;
    private List<DiaryWorkoutRequestDto> workouts = new ArrayList<>();
}
