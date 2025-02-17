package com.ssafy.bgs.attendance.exception;

public class AttendanceAlreadyCheckedException extends RuntimeException {
    public AttendanceAlreadyCheckedException(String message) {
        super(message);
    }
}