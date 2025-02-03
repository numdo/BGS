package com.ssafy.bgs.diary.exception;

import com.ssafy.bgs.common.NotFoundException;

public class DiaryNotFoundException extends NotFoundException {
    public DiaryNotFoundException(Integer diaryId) {
        super("삭제 또는 없는 다이어리: " + diaryId);
    }
}
