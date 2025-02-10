package com.ssafy.bgs.ai.service;

import com.ssafy.bgs.diary.entity.Workout;
import com.ssafy.bgs.diary.repository.WorkoutRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.text.similarity.LevenshteinDistance;
import org.apache.commons.text.similarity.JaroWinklerSimilarity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WorkoutMatchingService {

    private final WorkoutRepository workoutRepository;
    private final LevenshteinDistance levenshtein = LevenshteinDistance.getDefaultInstance();
    private final JaroWinklerSimilarity jaroWinkler = new JaroWinklerSimilarity();

    /**
     * STT 또는 GPT가 반환한 운동명과 DB에 저장된 운동명을 비교하여 가장 유사한 운동의 ID를 반환.
     */
    public Optional<Integer> findBestMatchingWorkoutId(String recognizedWorkoutName) {
        if (recognizedWorkoutName == null || recognizedWorkoutName.trim().isEmpty()) {
            return Optional.empty();
        }

        List<Workout> workouts = workoutRepository.findAll();
        Integer bestWorkoutId = null;
        double bestScore = 0.0; // 유사도 점수

        String inputName = normalizeText(recognizedWorkoutName);

        for (Workout workout : workouts) {
            String dbName = normalizeText(workout.getWorkoutName());

            // 1️⃣ Levenshtein 거리 계산 (정규화)
            int distance = levenshtein.apply(inputName, dbName);
            double normalizedDistance = 1.0 - ((double) distance / Math.max(inputName.length(), dbName.length()));

            // 2️⃣ Jaro-Winkler 유사도 계산
            double similarity = jaroWinkler.apply(inputName, dbName);

            // 3️⃣ 최종 유사도 점수 계산 (가중합)
            double finalScore = (normalizedDistance * 0.4) + (similarity * 0.6); // Jaro-Winkler 가중치 높임

            // 4️⃣ 최적의 workoutId 찾기 (기존 최고점보다 높으면 업데이트)
            if (finalScore > bestScore) {
                bestScore = finalScore;
                bestWorkoutId = workout.getWorkoutId();
            }
        }

        // ❗ 유사도가 0.8 이하이면 매칭 안 함 (조정 가능)
        if (bestWorkoutId == null || bestScore < 0.80) {
            return Optional.empty();
        }

        return Optional.of(bestWorkoutId);
    }

    /**
     * 🚀 띄어쓰기 제거 + 소문자로 변환 + 특수문자 제거
     */
    private String normalizeText(String text) {
        return text.replaceAll("\\s+", "") // 모든 띄어쓰기 제거
                .replaceAll("[^a-zA-Z가-힣0-9]", "") // 특수문자 제거
                .toLowerCase(); // 소문자 변환
    }
}
