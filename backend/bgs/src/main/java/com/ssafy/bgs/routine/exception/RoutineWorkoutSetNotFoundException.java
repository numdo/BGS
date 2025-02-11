package com.ssafy.bgs.routine.exception;

import com.ssafy.bgs.common.NotFoundException;

public class RoutineWorkoutSetNotFoundException extends NotFoundException {
    public RoutineWorkoutSetNotFoundException(Integer workoutSetId) {
        super("삭제 또는 없는 운동세트: " + workoutSetId);
    }
}
