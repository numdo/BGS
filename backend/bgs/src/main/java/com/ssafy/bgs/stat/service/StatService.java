package com.ssafy.bgs.stat.service;

import com.ssafy.bgs.diary.repository.DiaryWorkoutRepository;
import com.ssafy.bgs.stat.dto.request.WeightRequestDto;
import com.ssafy.bgs.stat.dto.response.WorkoutBalanceResponseDto;
import com.ssafy.bgs.stat.entity.WeightHistory;
import com.ssafy.bgs.stat.entity.WorkoutPart;
import com.ssafy.bgs.stat.repository.WeightHistoryRepository;
import com.ssafy.bgs.user.entity.User;
import com.ssafy.bgs.user.exception.UserNotFoundException;
import com.ssafy.bgs.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StatService {


    private final WeightHistoryRepository weightHistoryRepository;
    private final UserRepository userRepository;
    private final DiaryWorkoutRepository diaryWorkoutRepository;

    public StatService(WeightHistoryRepository weightHistoryRepository, UserRepository userRepository, DiaryWorkoutRepository diaryWorkoutRepository) {
        this.weightHistoryRepository = weightHistoryRepository;
        this.userRepository = userRepository;
        this.diaryWorkoutRepository = diaryWorkoutRepository;
    }

    public List<WeightHistory> getWeightHistories(Integer userId) {
        return weightHistoryRepository.findByUserId(userId);
    }

    public void addWeightHistory(WeightRequestDto weightRequestDto) {
        WeightHistory weightHistory = new WeightHistory();
        weightHistory.setUserId(weightRequestDto.getUserId());
        weightHistory.setWeight(weightHistory.getWeight());
        weightHistoryRepository.save(weightHistory);

        User user = userRepository.findById(weightRequestDto.getUserId()).orElseThrow(() -> new UserNotFoundException(weightHistory.getUserId()));
        user.setWeight(weightRequestDto.getWeight());
        userRepository.save(user);
    }

    public WorkoutBalanceResponseDto getWorkoutBalance(Integer userId, String scope) {
        WorkoutBalanceResponseDto workoutBalanceResponseDto = new WorkoutBalanceResponseDto();

        // 조회 범위 설정
        LocalDate startDate = null;
        if (!"all".equalsIgnoreCase(scope)) {
            LocalDate today = LocalDate.now();
            startDate = switch (scope.toLowerCase()) {
                case "week" -> today.minusDays(6);
                case "month" -> today.minusDays(29);
                case "year" -> today.minusDays(364);
                default -> throw new IllegalArgumentException("잘못된 scope 값입니다: " + scope);
            };
        }

        // 데이터 조회 (범위에 따라 조건 변경)
        List<Object[]> workoutCounts;
        if (startDate != null) {
            workoutCounts = diaryWorkoutRepository.countByUserIdAndAfterDateGroupedByPart(userId, startDate);
        } else {
            workoutCounts = diaryWorkoutRepository.countByUserIdGroupedByPart(userId);
        }

        // 결과를 Map<String, Long> 형태로 변환
        Map<String, Long> workoutCountMap = new HashMap<>();
        for (Object[] row : workoutCounts) {
            String part = (String) row[0];  // part 컬럼 값
            Long count = ((Number) row[1]).longValue();  // COUNT(dw) 값
            workoutCountMap.put(part, count);
        }

        // Enum을 활용해 기본값 0L로 설정
        Map<String, Long> partCounts = new HashMap<>();
        for (WorkoutPart part : WorkoutPart.values()) {
            partCounts.put(part.getValue(), workoutCountMap.getOrDefault(part.getValue(), 0L));
        }

        // 최대값 찾기 (0이 아닌 값들 중)
        long maxCount = partCounts.values().stream()
                .max(Long::compare)
                .orElse(1L); // 모든 값이 0이면 1로 설정하여 0으로 나누는 문제 방지

        // 비율 계산 및 응답 설정
        workoutBalanceResponseDto.setChest((int) (100 * partCounts.get("가슴") / maxCount));
        workoutBalanceResponseDto.setLat((int) (100 * partCounts.get("등") / maxCount));
        workoutBalanceResponseDto.setTriceps((int) (100 * partCounts.get("삼두") / maxCount));
        workoutBalanceResponseDto.setShoulder((int) (100 * partCounts.get("어깨") / maxCount));
        workoutBalanceResponseDto.setCardio((int) (100 * partCounts.get("유산소") / maxCount));
        workoutBalanceResponseDto.setBiceps((int) (100 * partCounts.get("이두") / maxCount));
        workoutBalanceResponseDto.setCore((int) (100 * partCounts.get("코어") / maxCount));
        workoutBalanceResponseDto.setLeg((int) (100 * partCounts.get("하체") / maxCount));

        return workoutBalanceResponseDto;
    }


}
