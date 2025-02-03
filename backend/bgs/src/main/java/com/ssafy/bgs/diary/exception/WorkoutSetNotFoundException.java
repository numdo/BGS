package com.ssafy.bgs.diary.exception;

public class WorkoutSetNotFoundException extends RuntimeException {
    public WorkoutSetNotFoundException(Integer workoutSetId) {
        super("삭제 또는 없는 운동세트: " + workoutSetId);
    }
}
