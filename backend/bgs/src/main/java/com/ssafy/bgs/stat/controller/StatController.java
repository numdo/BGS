package com.ssafy.bgs.stat.controller;

import com.ssafy.bgs.stat.dto.request.WeightRequestDto;
import com.ssafy.bgs.stat.dto.response.WorkoutBalanceResponseDto;
import com.ssafy.bgs.stat.entity.WeightHistory;
import com.ssafy.bgs.stat.service.StatService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stats")
public class StatController {

    private final StatService statService;

    public StatController(StatService statService) {
        this.statService = statService;
    }

    @GetMapping("/weight-histories")
    public ResponseEntity<?> getWeightHistories(
            @AuthenticationPrincipal Integer userId
    ) {
        List<WeightHistory> weightHistories = statService.getWeightHistories(userId);
        return new ResponseEntity<>(weightHistories, HttpStatus.OK);
    }

    @PostMapping("/weight-histories")
    public ResponseEntity<?> addWeightHistory(
            @AuthenticationPrincipal Integer userId,
            @RequestBody WeightRequestDto weightRequestDto
    ) {
        weightRequestDto.setUserId(userId);
        statService.addWeightHistory(weightRequestDto);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @GetMapping("/workout-balance")
    public ResponseEntity<?> getWorkoutBalance(
            @AuthenticationPrincipal Integer userId,
            @RequestParam(defaultValue = "all") String scope
    ) {
        WorkoutBalanceResponseDto workoutBalanceResponseDto = statService.getWorkoutBalance(userId, scope);
        return new ResponseEntity<>(workoutBalanceResponseDto, HttpStatus.OK);
    }
}
