package com.ssafy.bgs.gym.exception;

import com.ssafy.bgs.common.NotFoundException;

public class GymNotFoundException extends NotFoundException {
    public GymNotFoundException(Integer gymId) {
        super("삭제 또는 없는 헬스장: " + gymId);
    }
}
