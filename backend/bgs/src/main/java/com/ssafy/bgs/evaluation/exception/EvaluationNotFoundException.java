package com.ssafy.bgs.evaluation.exception;

import com.ssafy.bgs.common.NotFoundException;

public class EvaluationNotFoundException extends NotFoundException {
    public EvaluationNotFoundException(Integer EvaluationId) {
        super("삭제 또는 없는 평가: " + EvaluationId);
    }
}
