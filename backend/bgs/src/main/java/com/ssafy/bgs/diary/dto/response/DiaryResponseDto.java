package com.ssafy.bgs.diary.dto.response;

import com.ssafy.bgs.image.dto.response.ImageResponseDto;
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
    private String profileImageUrl;
    private String writer;
    private Date workoutDate;
    private String content;
    private String allowedScope;
    private Boolean isLiked;
    private Long likedCount;
    private Timestamp createdAt;
    private Timestamp modifiedAt;
    private List<String> hashtags = new ArrayList<>();
    private List<DiaryWorkoutResponseDto> diaryWorkouts = new ArrayList<>();
    private List<ImageResponseDto> images = new ArrayList<>();
}
