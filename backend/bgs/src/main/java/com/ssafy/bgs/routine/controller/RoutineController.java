package com.ssafy.bgs.routine.controller;

import com.ssafy.bgs.routine.dto.request.RoutineRequestDto;
import com.ssafy.bgs.routine.dto.response.PreviousWorkoutResponseDto;
import com.ssafy.bgs.routine.dto.response.RecentWorkoutResponseDto;
import com.ssafy.bgs.routine.dto.response.RoutineResponseDto;
import com.ssafy.bgs.diary.entity.Workout;
import com.ssafy.bgs.routine.entity.Routine;
import com.ssafy.bgs.routine.service.RoutineService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/routines")
public class RoutineController {

    private final RoutineService routineService;

    public RoutineController(RoutineService routineService) {
        this.routineService = routineService;
    }

    /**
     * Routine 목록 조회
     * Query parameters: userId, year, month
     * (조회 조건에 맞게 현재 날짜를 기본값으로 사용)
     */
    @GetMapping
    public ResponseEntity<List<Routine>> getRoutineList(
            @RequestParam Integer userId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        LocalDate today = LocalDate.now();
        int defaultYear = (year != null) ? year : today.getYear();
        int defaultMonth = (month != null) ? month : today.getMonthValue();
        List<Routine> routines = routineService.getRoutineList(userId, defaultYear, defaultMonth);
        return new ResponseEntity<>(routines, HttpStatus.OK);
    }

    /**
     * Routine 등록
     * - 요청 본문은 multipart/form-data 형식으로 routine JSON과 선택적 파일 리스트(files)를 전송
     */
    @PostMapping
    public ResponseEntity<Void> addRoutine(
            @AuthenticationPrincipal Integer userId,
            @RequestPart("routine") RoutineRequestDto routineRequestDto,
            @RequestPart(name = "files", required = false) List<MultipartFile> files) {
        routineRequestDto.setUserId(userId);
        routineService.addRoutine(routineRequestDto, files);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    /**
     * Routine 단건 조회
     */
    @GetMapping("/{routineId}")
    public ResponseEntity<RoutineResponseDto> getRoutine(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer routineId) {
        RoutineResponseDto routineResponseDto = routineService.getRoutine(userId, routineId);
        return new ResponseEntity<>(routineResponseDto, HttpStatus.OK);
    }

    /**
     * Routine 수정
     * - 수정 시에도 multipart/form-data로 routine JSON, 이미지 삭제 대상 URL 리스트(urls), 신규 파일(files)을 전달
     */
    @PatchMapping("/{routineId}")
    public ResponseEntity<Void> updateRoutine(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer routineId,
            @RequestPart("routine") RoutineRequestDto routineRequestDto,
            @RequestPart(name = "urls", required = false) List<String> urls,
            @RequestPart(name = "files", required = false) List<MultipartFile> files) {
        routineRequestDto.setRoutineId(routineId);
        routineService.updateRoutine(userId, routineRequestDto, urls, files);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * Routine 삭제
     */
    @DeleteMapping("/{routineId}")
    public ResponseEntity<Void> deleteRoutine(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer routineId) {
        routineService.deleteRoutine(userId, routineId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * 모든 운동 조회
     */
    @GetMapping("/workout")
    public ResponseEntity<List<Workout>> getAllWorkouts() {
        List<Workout> workouts = routineService.getAllWorkouts();
        return new ResponseEntity<>(workouts, HttpStatus.OK);
    }

    /**
     * 특정 운동 검색
     */
    @GetMapping("/workout/search")
    public ResponseEntity<List<Workout>> searchWorkouts(@RequestParam String keyword) {
        List<Workout> workouts = routineService.searchWorkouts(keyword);
        return new ResponseEntity<>(workouts, HttpStatus.OK);
    }

    /**
     * 이전 운동 기록 조회
     */
    @GetMapping("/workout/previous")
    public ResponseEntity<List<PreviousWorkoutResponseDto>> getPreviousWorkouts(
            Authentication authentication,
            @RequestParam(defaultValue = "5") int limit) {
        if (authentication == null || authentication.getName() == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        Integer userId = Integer.parseInt(authentication.getName());
        List<PreviousWorkoutResponseDto> records = routineService.getPreviousWorkoutRecords(userId, limit);
        return new ResponseEntity<>(records, HttpStatus.OK);
    }

    /**
     * 최근 운동 기록 조회
     */
    @GetMapping("/workout/recent")
    public ResponseEntity<List<RecentWorkoutResponseDto>> getRecentWorkouts(
            Authentication authentication,
            @RequestParam(defaultValue = "20") int limit) {
        if (authentication == null || authentication.getName() == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        Integer userId = Integer.parseInt(authentication.getName());
        List<RecentWorkoutResponseDto> records = routineService.getRecentWorkouts(userId, limit);
        return new ResponseEntity<>(records, HttpStatus.OK);
    }
    @GetMapping("/recent")
    public ResponseEntity<List<Routine>> getRecentRoutines(
            @AuthenticationPrincipal Integer userId,
            @RequestParam(defaultValue = "5") int limit) {
        List<Routine> routines = routineService.getRecentRoutines(userId, limit);
        return new ResponseEntity<>(routines, HttpStatus.OK);
    }

    // 새롭게 추가: 추천 운동 세트 생성 (추천 루틴 생성)
    @PostMapping("/recommended/records")
    public ResponseEntity<RoutineResponseDto> createRecommendedRoutine(@AuthenticationPrincipal Integer userId) {
        RoutineResponseDto dto = routineService.createRecommendedRoutine(userId);
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }

    // GPT 기반 추천 운동 세트 생성
    @PostMapping("/recommended/gpt")
    public ResponseEntity<RoutineResponseDto> createRecommendedRoutineFromGPT(@AuthenticationPrincipal Integer userId) {
        RoutineResponseDto dto = routineService.createRecommendedRoutineFromGPT(userId);
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }
}
