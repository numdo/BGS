package com.ssafy.bgs.attendance.exception;

public class GymNotFoundException extends RuntimeException {
    public GymNotFoundException(String message) {
        super(message);
    }
}
