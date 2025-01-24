package com.ssafy.bgs.diary.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.sql.Date;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class DiaryResponseDto {
    private Integer diaryId;
    private Integer userId;
    private Date workoutDate;
    private String content;
    private String allowedScope;
    private Long likedCount;
    private Timestamp createdAt;
    private Timestamp modifiedAt;
    private List<String> hashtags = new ArrayList<>();
    private List<DiaryWorkoutResponseDto> diaryWorkouts = new ArrayList<>();
}
