package com.ssafy.bgs.diary.exception;

import com.ssafy.bgs.common.NotFoundException;

public class CommentNotFoundException extends NotFoundException {
    public CommentNotFoundException(Integer commentId) {
        super("삭제 또는 없는 댓글: " + commentId);
    }
}
