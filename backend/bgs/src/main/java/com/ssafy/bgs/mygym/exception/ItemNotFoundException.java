package com.ssafy.bgs.mygym.exception;

import com.ssafy.bgs.common.NotFoundException;

public class ItemNotFoundException extends NotFoundException {
    public ItemNotFoundException(Integer itemId) { super("비활성화 또는 없는 아이템: " + itemId); }
}
