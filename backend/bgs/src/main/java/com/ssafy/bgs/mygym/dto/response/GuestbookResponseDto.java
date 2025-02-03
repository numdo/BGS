package com.ssafy.bgs.mygym.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;

@Getter
@Setter
public class GuestbookResponseDto {
    private Integer guestbookId;
    private Integer ownerId;
    private Integer guestId;
    private String content;
    private Timestamp createdAt;
    private Boolean deleted;

    public GuestbookResponseDto(Integer guestbookId, Integer ownerId, Integer guestId, String content, Timestamp createdAt, Boolean deleted) {
        this.guestbookId = guestbookId;
        this.ownerId = ownerId;
        this.guestId = guestId;
        this.content = content;
        this.createdAt = createdAt;
        this.deleted = deleted;
    }
}
