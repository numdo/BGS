package com.ssafy.bgs.stat.controller;

import com.ssafy.bgs.ai.service.GPTService;
import com.ssafy.bgs.redis.service.RedisService;
import com.ssafy.bgs.stat.dto.request.WeightRequestDto;
import com.ssafy.bgs.stat.dto.response.PartVolumeResponseDto;
import com.ssafy.bgs.stat.dto.response.WorkoutBalanceResponseDto;
import com.ssafy.bgs.stat.dto.response.WorkoutRecordResponseDto;
import com.ssafy.bgs.stat.entity.WeightHistory;
import com.ssafy.bgs.stat.service.StatService;
import com.ssafy.bgs.user.entity.User;
import com.ssafy.bgs.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatController {

    private final StatService statService;
    private final GPTService gptService;
    private final UserRepository userRepository;
    private final RedisService redisService;

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

    @GetMapping("/part-volume")
    public ResponseEntity<?> getPartVolume(@AuthenticationPrincipal Integer userId) {
        Map<String, PartVolumeResponseDto> weeklyPartVolume = statService.getPartVolume(userId);
        return new ResponseEntity<>(weeklyPartVolume, HttpStatus.OK);
    }

    @GetMapping("/workout-record")
    public ResponseEntity<?> getWorkoutRecord(@AuthenticationPrincipal Integer userId) {
        return new ResponseEntity<>(statService.getWorkoutRecord(userId), HttpStatus.OK);
    }

    @GetMapping("/orm")
    public ResponseEntity<?> getOrm(@AuthenticationPrincipal Integer userId) {
        return new ResponseEntity<>(statService.getOrm(userId), HttpStatus.OK);
    }

    @GetMapping("/comprehensive-advice")
    public ResponseEntity<?> getComprehensiveAdvice(@AuthenticationPrincipal Integer userId) {
        // 캐시 키 구성 (예: "comprehensiveAdvice:123")
        String cacheKey = "comprehensiveAdvice:" + userId;
        Object cached = redisService.getValue(cacheKey);
        if (cached != null) {
            return ResponseEntity.ok(cached);
        }

        // 1) 밸런스
        WorkoutBalanceResponseDto balance = statService.getWorkoutBalance(userId, "all");
        // 2) 부위별 운동량
        Map<String, PartVolumeResponseDto> partVolume = statService.getPartVolume(userId);
        // 3) 3대 운동
        WorkoutRecordResponseDto record = statService.getWorkoutRecord(userId);
        // 4) 최근 몸무게
        if (balance == null || record == null || partVolume.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("아직 데이터가 부족해 조언을 받을 수 없습니다.");
        }
        List<WeightHistory> whList = statService.getWeightHistories(userId);
        Double recentWeight = 0.0;
        if (!whList.isEmpty()) {
            WeightHistory last = whList.get(whList.size() - 1);
            recentWeight = last.getWeight();
        }
        // 5) 키/나이
        User user = userRepository.findById(userId).orElse(null);
        Double userHeight = user != null ? user.getHeight() : null;
        Integer userAge = user != null && user.getBirthDate() != null ?
                2023 - user.getBirthDate().getYear() : null;

        // 6) GPTService 호출하여 종합 조언 생성
        String gptResult = gptService.analyzeComprehensive(
                balance,
                partVolume,
                record,
                recentWeight,
                userHeight,
                userAge
        );

        // Redis에 캐시 저장 (TTL 5분)
        redisService.setValue(cacheKey, gptResult, 5);

        return ResponseEntity.ok(gptResult);
    }
}