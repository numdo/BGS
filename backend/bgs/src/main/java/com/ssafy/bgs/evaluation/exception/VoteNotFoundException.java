package com.ssafy.bgs.evaluation.exception;

import com.ssafy.bgs.common.NotFoundException;

public class VoteNotFoundException extends NotFoundException {
    public VoteNotFoundException() {
        super("취소할 투표가 없습니다.");
    }
}
