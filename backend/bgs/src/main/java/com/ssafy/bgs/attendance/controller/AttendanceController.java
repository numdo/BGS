package com.ssafy.bgs.attendance.controller;

import com.ssafy.bgs.attendance.dto.request.AttendanceCheckRequestDto;
import com.ssafy.bgs.attendance.dto.response.AttendanceCheckResponseDto;
import com.ssafy.bgs.attendance.exception.AttendanceAlreadyCheckedException;
import com.ssafy.bgs.attendance.exception.GymNotFoundException;
import com.ssafy.bgs.attendance.exception.OutOfRangeException;
import com.ssafy.bgs.attendance.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<String> checkInAttendance(Authentication authentication,
                                                    @RequestBody AttendanceCheckRequestDto request) {
        Integer userId = (Integer) authentication.getPrincipal();
        try {
            int streak = attendanceService.checkAttendance(userId, request);
            return ResponseEntity.ok("출석 체크 완료 (연속 출석 일수: " + streak + "일)");
        } catch (AttendanceAlreadyCheckedException e) {
            // 이미 출석한 경우 Conflict(409)
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("출석 체크 실패: " + e.getMessage());
        } catch (GymNotFoundException e) {
            // 헬스장을 찾을 수 없는 경우 Not Found(404)
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("출석 체크 실패: " + e.getMessage());
        } catch (OutOfRangeException e) {
            // 헬스장과의 거리가 멀 경우 Bad Request(400)
            return ResponseEntity.badRequest()
                    .body("출석 체크 실패: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body("출석 체크 실패: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("서버 오류가 발생했습니다.");
        }
    }

    @GetMapping("/current-month")
    public List<AttendanceCheckResponseDto> getCurrentMonthAttendance(Authentication authentication) {
        Integer userId = (Integer) authentication.getPrincipal();
        return attendanceService.getCurrentMonthAttendance(userId);
    }

    @GetMapping("/date")
    public ResponseEntity<?> getAttendanceByDate(Authentication authentication,
                                                 @RequestParam("date") String dateString) {
        try {
            LocalDate date = LocalDate.parse(dateString);
            Integer userId = (Integer) authentication.getPrincipal();
            List<AttendanceCheckResponseDto> attendanceList = attendanceService.getAttendanceByDate(userId, date);
            return ResponseEntity.ok(attendanceList);
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest()
                    .body("잘못된 날짜 형식입니다. (YYYY-MM-DD 형식이어야 합니다.)");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("서버 오류가 발생했습니다.");
        }
    }

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
            return ResponseEntity.badRequest()
                    .body("잘못된 날짜 형식입니다. (YYYY-MM-DD 형식이어야 합니다.)");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("서버 오류가 발생했습니다.");
        }
    }
}
