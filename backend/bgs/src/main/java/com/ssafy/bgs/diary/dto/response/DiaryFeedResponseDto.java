package com.ssafy.bgs.diary.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.sql.Date;

@Getter
@Setter
public class DiaryFeedResponseDto {
    private Integer diaryId;
    private String allowedScope;
    private Date workoutDate;
    private String imageUrl;
    private Long likedCount;
    private Long commentCount;

    DiaryFeedResponseDto(Integer diaryId, String allowedScope, Date workoutDate) {
        this.diaryId = diaryId;
        this.allowedScope = allowedScope;
        this.workoutDate = workoutDate;
    }
}
