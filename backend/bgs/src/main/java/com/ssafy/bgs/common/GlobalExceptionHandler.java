package com.ssafy.bgs.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 400 Bad Request (잘못된 요청)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException e) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Invalid Request", e.getMessage());
    }

    // 401 UNAUTHORIZED (접근 권한 없음)
    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<Map<String, String>> handleUnauthorized(UnauthorizedAccessException e) {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, "Unauthorized", e.getMessage());
    }

    // 404 Not Found (존재하지 않는 리소스)
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(NotFoundException e) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, "Resource Not Found", e.getMessage());
    }

    // 409 Conflict (중복된 데이터)
    @ExceptionHandler(DuplicatedException.class)
    public ResponseEntity<Map<String, String>> handleDuplicatedRequest(DuplicatedException e) {
        return buildErrorResponse(HttpStatus.CONFLICT, "Duplicated Request", e.getMessage());
    }

    // 500 Internal Server Error (서버 내부 오류)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGlobalException(Exception e) {
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", e.getMessage());
    }

    // 공통 응답 생성 메서드
    private ResponseEntity<Map<String, String>> buildErrorResponse(HttpStatus status, String error, String message) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", error);
        errorResponse.put("message", message);
        return ResponseEntity.status(status).body(errorResponse);
    }
}
