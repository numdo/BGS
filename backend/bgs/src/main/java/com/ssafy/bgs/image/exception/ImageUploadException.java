package com.ssafy.bgs.image.exception;

public class ImageUploadException extends RuntimeException {
    public ImageUploadException() {
        super("이미지 업로드 실패");
    }
}
