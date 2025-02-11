package com.ssafy.bgs.routine.exception;

import com.ssafy.bgs.common.NotFoundException;

public class RoutineNotFoundException extends NotFoundException {
    public RoutineNotFoundException(Integer diaryId) {
        super("삭제 또는 없는 다이어리: " + diaryId);
    }
}
