package com.ssafy.bgs.mygym.exception;

import com.ssafy.bgs.common.NotFoundException;

public class GuestbookNotFoundException extends NotFoundException {
    public GuestbookNotFoundException(Integer guestbookId) {
        super("삭제 또는 없는 방명록: " + guestbookId);
    }
}
