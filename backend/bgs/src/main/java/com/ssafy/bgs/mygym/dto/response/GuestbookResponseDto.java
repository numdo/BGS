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
}
