package com.ssafy.bgs.attendance.exception;

public class OutOfRangeException extends RuntimeException {
    public OutOfRangeException(String message) {
        super(message);
    }
}
