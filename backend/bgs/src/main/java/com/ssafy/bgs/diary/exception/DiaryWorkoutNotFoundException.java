package com.ssafy.bgs.diary.exception;

public class DiaryWorkoutNotFoundException extends RuntimeException {
    public DiaryWorkoutNotFoundException(Integer diaryWorkoutId) {
        super("삭제 또는 없는 운동목록: " + diaryWorkoutId);
    }
}
