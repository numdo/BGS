package com.ssafy.bgs.diary.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class DiaryRequestDto {
    private Integer diaryId;
    private Integer userId;
    private Date workoutDate;
    private String content;
    private String allowedScope;
    private List<String> hashtags = new ArrayList<>();
    private List<DiaryWorkoutRequestDto> diaryWorkouts = new ArrayList<>();
}
