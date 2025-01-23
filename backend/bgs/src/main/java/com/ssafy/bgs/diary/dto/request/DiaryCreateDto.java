package com.ssafy.bgs.diary.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class DiaryCreateDto {
    private Integer diaryId;
    private Integer userId;
    private Date workoutDate;
    private String content;
    private String allowedScope;
    private List<DiaryWorkoutRequestDto> workouts = new ArrayList<>();
}
