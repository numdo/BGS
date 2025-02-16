package com.ssafy.bgs.stat.service;

import com.ssafy.bgs.diary.repository.DiaryWorkoutRepository;
import com.ssafy.bgs.diary.repository.WorkoutSetRepository;
import com.ssafy.bgs.stat.dto.request.WeightRequestDto;
import com.ssafy.bgs.stat.dto.response.PartVolumeResponseDto;
import com.ssafy.bgs.stat.dto.response.WorkoutBalanceResponseDto;
import com.ssafy.bgs.stat.entity.WeightHistory;
import com.ssafy.bgs.stat.entity.WorkoutPart;
import com.ssafy.bgs.stat.repository.WeightHistoryRepository;
import com.ssafy.bgs.user.entity.User;
import com.ssafy.bgs.user.exception.UserNotFoundException;
import com.ssafy.bgs.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StatService {


    private final WeightHistoryRepository weightHistoryRepository;
    private final UserRepository userRepository;
    private final DiaryWorkoutRepository diaryWorkoutRepository;
    private final WorkoutSetRepository workoutSetRepository;

    public StatService(WeightHistoryRepository weightHistoryRepository, UserRepository userRepository, DiaryWorkoutRepository diaryWorkoutRepository, WorkoutSetRepository workoutSetRepository) {
        this.weightHistoryRepository = weightHistoryRepository;
        this.userRepository = userRepository;
        this.diaryWorkoutRepository = diaryWorkoutRepository;
        this.workoutSetRepository = workoutSetRepository;
    }

    public List<WeightHistory> getWeightHistories(Integer userId) {
        return weightHistoryRepository.findByUserId(userId);
    }

    public void addWeightHistory(WeightRequestDto weightRequestDto) {
        WeightHistory weightHistory = new WeightHistory();
        weightHistory.setUserId(weightRequestDto.getUserId());
        weightHistory.setWeight(weightRequestDto.getWeight());
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
            Long count = ((Number) row[1]).longValue();  // COUNT 값
            workoutCountMap.put(part, count);
        }

        // Enum을 활용해 기본값 0L로 설정
        Map<String, Long> partCounts = new HashMap<>();
        for (WorkoutPart part : WorkoutPart.values()) {
            partCounts.put(part.getValue(), workoutCountMap.getOrDefault(part.getValue(), 0L));
        }

        // 최대값 찾기 (모든 값이 0이면 maxCount가 0이 되므로 1로 설정)
        long maxCount = partCounts.values().stream()
                .max(Long::compare)
                .orElse(0L);
        if (maxCount == 0) {
            maxCount = 1;
        }

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



    public Map<String, PartVolumeResponseDto> getPartVolume(Integer userId) {
        Map<String, PartVolumeResponseDto> weeklyPartVolume = new HashMap<>();

        // 날짜 범위 설정
        Date thisWeekStart = Date.valueOf(LocalDate.now().minusDays(6));
        Date lastWeekStart = Date.valueOf(LocalDate.now().minusDays(13));
        Date twoWeeksAgoStart = Date.valueOf(LocalDate.now().minusDays(20));

        Date thisWeekEnd = Date.valueOf(LocalDate.now());
        Date lastWeekEnd = Date.valueOf(LocalDate.now().minusDays(7));
        Date twoWeeksAgoEnd = Date.valueOf(LocalDate.now().minusDays(14));

        // 데이터 조회
        weeklyPartVolume.put("thisWeek", fetchPartVolume(userId, thisWeekStart, thisWeekEnd));
        weeklyPartVolume.put("lastWeek", fetchPartVolume(userId, lastWeekStart, lastWeekEnd));
        weeklyPartVolume.put("twoWeeksAgo", fetchPartVolume(userId, twoWeeksAgoStart, twoWeeksAgoEnd));

        return weeklyPartVolume;
    }

    // 부위별 볼륨 조회 메서드
    private PartVolumeResponseDto fetchPartVolume(Integer userId, Date startDate, Date endDate) {
        List<Object[]> results = workoutSetRepository.findWorkoutVolumeByPart(userId, startDate, endDate);
        PartVolumeResponseDto responseDto = new PartVolumeResponseDto();

        // 기본값 0으로 초기화
        responseDto.setChest(0);
        responseDto.setLat(0);
        responseDto.setTriceps(0);
        responseDto.setShoulder(0);
        responseDto.setBiceps(0);
        responseDto.setLeg(0);

        for (Object[] row : results) {
            String part = (String) row[0]; // 운동 부위
            Integer totalVolume = ((Double) row[1]).intValue(); // 볼륨 값

            // 부위별로 매핑
            switch (part) {
                case "가슴" -> responseDto.setChest(totalVolume);
                case "등" -> responseDto.setLat(totalVolume);
                case "삼두" -> responseDto.setTriceps(totalVolume);
                case "어깨" -> responseDto.setShoulder(totalVolume);
                case "이두" -> responseDto.setBiceps(totalVolume);
                case "하체" -> responseDto.setLeg(totalVolume);
            }
        }

        return responseDto;
    }
}
