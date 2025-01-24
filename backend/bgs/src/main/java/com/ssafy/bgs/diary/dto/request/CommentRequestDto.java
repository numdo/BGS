package com.ssafy.bgs.diary.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentRequestDto {
    private Integer commentId;
    private Integer diaryId;
    private Integer userId;
    private String content;
}
