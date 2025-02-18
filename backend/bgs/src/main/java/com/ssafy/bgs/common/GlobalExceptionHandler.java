package com.ssafy.bgs.common;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // 400 Bad Request (잘못된 요청)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException e) {
        log.error("Bad Request", e);
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Invalid Request", "요청 정보가 올바르지 않습니다.");
    }

    // 403 FORBIDDEN (접근 권한 없음)
    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<Map<String, String>> handleUnauthorized(UnauthorizedAccessException e) {
        log.error("Unauthorized access", e);
        return buildErrorResponse(HttpStatus.FORBIDDEN, "Forbidden", "접근 권한이 없습니다.");
    }

    // 404 Not Found (존재하지 않는 리소스)
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(NotFoundException e) {
        log.error("Resource not found", e);
        return buildErrorResponse(HttpStatus.NOT_FOUND, "Resource Not Found", "요청하신 리소스를 찾을 수 없습니다.");
    }

    // 409 Conflict (중복된 데이터)
    @ExceptionHandler(DuplicatedException.class)
    public ResponseEntity<Map<String, String>> handleDuplicatedRequest(DuplicatedException e) {
        log.error("Duplicated request", e);
        return buildErrorResponse(HttpStatus.CONFLICT, "Duplicated Request", "이미 존재하는 데이터입니다.");
    }

    // 500 Internal Server Error (서버 내부 오류)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGlobalException(Exception e) {
        log.error("Internal server error", e);
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", "서버 내부 오류가 발생했습니다.");
    }

    // 공통 응답 생성 메서드
    private ResponseEntity<Map<String, String>> buildErrorResponse(HttpStatus status, String error, String message) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", error);
        errorResponse.put("message", message);
        return ResponseEntity.status(status).body(errorResponse);
    }

    // 파일 업로드 사이즈 초과 예외 처리
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<String> handleMaxSizeException(MaxUploadSizeExceededException ex) {
        log.error("File size exceeded", ex);
        return ResponseEntity
                .status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body("업로드 가능한 파일 크기를 초과하였습니다. 최대 100MB 까지 업로드 가능합니다.");
    }
}
