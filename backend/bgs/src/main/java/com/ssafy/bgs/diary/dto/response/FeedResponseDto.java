package com.ssafy.bgs.diary.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FeedResponseDto {
    private Integer diaryId;
    private String allowedScope;
    private String imageUrl;
    private Long likedCount;
    private Long commentCount;

    FeedResponseDto(Integer diaryId, String allowedScope) {
        this.diaryId = diaryId;
        this.allowedScope = allowedScope;
    }
}
