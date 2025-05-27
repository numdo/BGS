package com.ssafy.bgs.user.exception;

import com.ssafy.bgs.common.NotFoundException;

public class UserNotFoundException extends NotFoundException {
    public UserNotFoundException(Integer userId) {
        super("삭제 또는 없는 유저: " + userId);
    }
}
