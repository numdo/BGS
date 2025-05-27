package com.ssafy.bgs.diary.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;

@Getter
@Setter
public class CommentResponseDto {
    private Integer commentId;
    private Integer diaryId;
    private Integer userId;
    private String writer;
    private String content;
    private String profileUrl;
    private Timestamp createdAt;
    private Timestamp modifiedAt;
    private Boolean deleted;

    public CommentResponseDto(Integer commentId, Integer diaryId, Integer userId, String writer, String content, Timestamp createdAt, Timestamp modifiedAt, Boolean deleted) {
        this.commentId = commentId;
        this.diaryId = diaryId;
        this.userId = userId;
        this.writer = writer;
        this.content = content;
        this.createdAt = createdAt;
        this.modifiedAt = modifiedAt;
        this.deleted = deleted;
    }

}
