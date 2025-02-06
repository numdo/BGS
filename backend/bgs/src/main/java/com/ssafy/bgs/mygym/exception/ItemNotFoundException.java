package com.ssafy.bgs.mygym.exception;

import com.ssafy.bgs.common.NotFoundException;

public class ItemNotFoundException extends NotFoundException {
    public ItemNotFoundException(Integer itemId) { super("삭제 또는 없는 댓글: " + itemId); }
}
