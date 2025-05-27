package com.ssafy.bgs.user.exception;

import com.ssafy.bgs.common.NotFoundException;

public class FollowingNotFoundException extends NotFoundException {
    public FollowingNotFoundException(String message) {
        super(message);
    }
}
