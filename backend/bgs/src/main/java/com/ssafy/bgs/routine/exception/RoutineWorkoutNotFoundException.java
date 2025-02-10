package com.ssafy.bgs.routine.exception;

import com.ssafy.bgs.common.NotFoundException;

public class RoutineWorkoutNotFoundException extends NotFoundException {
    public RoutineWorkoutNotFoundException(Integer diaryWorkoutId) {
        super("삭제 또는 없는 운동목록: " + diaryWorkoutId);
    }
}
