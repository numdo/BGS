package com.ssafy.bgs.user.exception;

public class EmailNotFoundException extends RuntimeException {
    public EmailNotFoundException() {
        super("해당 이메일을 사용하는 사용자가 없습니다.");
    }
}
