package com.ssafy.bgs.mygym.exception;

import com.ssafy.bgs.common.NotFoundException;

public class PlaceNotFoundException extends NotFoundException {
    public PlaceNotFoundException(Integer placeId) {
        super("삭제 또는 없는 배치: " + placeId);
    }
}
