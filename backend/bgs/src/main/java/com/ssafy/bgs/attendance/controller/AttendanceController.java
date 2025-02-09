package com.ssafy.bgs.attendance.controller;

import com.ssafy.bgs.attendance.dto.request.AttendanceCheckRequestDto;
import com.ssafy.bgs.attendance.dto.response.AttendanceCheckResponseDto;
import com.ssafy.bgs.attendance.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
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

    @GetMapping("/date")
    public ResponseEntity<?> getAttendanceByDate(Authentication authentication,
                                                 @RequestParam("date") String dateString) {
        try {
            // 날짜 형식 검증 및 변환
            LocalDate date = LocalDate.parse(dateString);
            Integer userId = (Integer) authentication.getPrincipal();
            List<AttendanceCheckResponseDto> attendanceList = attendanceService.getAttendanceByDate(userId, date);
            return ResponseEntity.ok(attendanceList);
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body("잘못된 날짜 형식입니다. (YYYY-MM-DD 형식이어야 합니다.)");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("서버 오류가 발생했습니다.");
        }
    }
    // 추가된 API: 시작일과 종료일을 지정하여 출석 정보 조회
    @GetMapping("/range")
    public ResponseEntity<?> getAttendanceByDateRange(Authentication authentication,
                                                      @RequestParam("start") String startDateString,
                                                      @RequestParam("end") String endDateString) {
        try {
            LocalDate startDate = LocalDate.parse(startDateString);
            LocalDate endDate = LocalDate.parse(endDateString);
            Integer userId = (Integer) authentication.getPrincipal();
            List<AttendanceCheckResponseDto> attendanceList = attendanceService.getAttendanceBetweenDates(userId, startDate, endDate);
            return ResponseEntity.ok(attendanceList);
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body("잘못된 날짜 형식입니다. (YYYY-MM-DD 형식이어야 합니다.)");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("서버 오류가 발생했습니다.");
        }
    }
}
