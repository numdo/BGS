package com.ssafy.bgs.image.exception;

import com.ssafy.bgs.common.NotFoundException;

public class ImageNotFoundException extends NotFoundException {
    public ImageNotFoundException(Long imageId) {
        super("삭제 또는 없는 이미지: " + imageId);
    }
}
