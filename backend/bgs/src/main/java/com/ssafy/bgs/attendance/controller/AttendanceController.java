package com.ssafy.bgs.attendance.controller;

import com.ssafy.bgs.attendance.dto.request.AttendanceCheckRequestDto;
import com.ssafy.bgs.attendance.dto.response.AttendanceCheckResponseDto;
import com.ssafy.bgs.attendance.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {
    private final AttendanceService attendanceService;

    @PostMapping("/check")
    public ResponseEntity<String> checkInAttendance(Authentication authentication, @RequestBody AttendanceCheckRequestDto request) {
        Integer userId = (Integer) authentication.getPrincipal();
        try {
            attendanceService.checkAttendance(userId, request);
            return ResponseEntity.ok("출석 체크 완료");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("출석 체크 실패: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("서버 오류가 발생했습니다.");
        }
    }

    @GetMapping("/current-month")
    public List<AttendanceCheckResponseDto> getCurrentMonthAttendance(Authentication authentication) {
        // authentication.getPrincipal()가 Integer 타입인 userId로 변환되는 것을 가정
        Integer userId = (Integer) authentication.getPrincipal();
        return attendanceService.getCurrentMonthAttendance(userId);
    }
}
