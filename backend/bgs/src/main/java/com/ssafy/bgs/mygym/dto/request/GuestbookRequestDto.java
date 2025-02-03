package com.ssafy.bgs.mygym.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GuestbookRequestDto {
    private Integer guestbookId;
    private Integer ownerId;
    private Integer guestId;
    private String content;
    private Boolean deleted;
}
