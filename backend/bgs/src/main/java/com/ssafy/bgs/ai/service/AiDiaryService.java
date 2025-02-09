package com.ssafy.bgs.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.bgs.ai.dto.request.AudioDiaryRequestDto;
import com.ssafy.bgs.ai.dto.response.AiDiaryResponseDto;
import com.ssafy.bgs.diary.dto.request.DiaryWorkoutRequestDto;
import com.ssafy.bgs.diary.dto.request.WorkoutSetRequestDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiDiaryService {

    private final SpeechToTextService sttService;
    private final GPTService gptService;
    private final WorkoutMatchingService workoutMatchingService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiDiaryResponseDto createDiaryFromAudio(AudioDiaryRequestDto audioReq) {
        try {
            // 1️⃣ STT 변환
            String sttResult = sttService.transcribe(audioReq.getAudioFile());
            log.info("✅ STT 변환 결과: {}", sttResult);

            // 2️⃣ GPT 분석 (STT 결과 보정 후 JSON 변환)
            String gptResult = gptService.analyzeWorkout(sttResult);
            log.info("🔍 GPT 분석 결과: {}", gptResult);

            // 3️⃣ JSON 파싱
            JsonNode root = objectMapper.readTree(gptResult);
            JsonNode workoutsNode = root.path("workouts");

            List<DiaryWorkoutRequestDto> diaryWorkouts = new ArrayList<>();
            List<String> unrecognizedWorkouts = new ArrayList<>();

            if (workoutsNode.isEmpty()) {
                log.warn("⚠️ GPT 분석 결과에서 운동 데이터 없음!");
                return AiDiaryResponseDto.builder()
                        .sttResult(sttResult)
                        .gptResult(gptResult)
                        .diaryWorkouts(diaryWorkouts)
                        .unrecognizedWorkouts(unrecognizedWorkouts)
                        .invalidInput(true)
                        .build();
            }

            for (JsonNode workoutNode : workoutsNode) {
                String workoutName = workoutNode.path("workoutName").asText();
                JsonNode setsNode = workoutNode.path("sets");

                // 4️⃣ Workout ID 매칭 (DB에서 찾기)
                Optional<Integer> matchedWorkoutId = workoutMatchingService.findBestMatchingWorkoutId(workoutName);
                if (matchedWorkoutId.isEmpty()) {
                    log.warn("❌ DB에서 운동 '{}'을(를) 찾을 수 없음", workoutName);
                    unrecognizedWorkouts.add(workoutName);
                    continue;
                }

                DiaryWorkoutRequestDto workoutReq = new DiaryWorkoutRequestDto();
                workoutReq.setWorkoutId(matchedWorkoutId.get());
                workoutReq.setDeleted(false);

                List<WorkoutSetRequestDto> setList = new ArrayList<>();
                for (JsonNode setNode : setsNode) {
                    WorkoutSetRequestDto ws = new WorkoutSetRequestDto();
                    ws.setWeight((float) setNode.path("weight").asDouble());
                    ws.setRepetition(setNode.path("reps").asInt());
                    ws.setWorkoutTime(0);
                    setList.add(ws);
                }
                workoutReq.setSets(setList);
                diaryWorkouts.add(workoutReq);
            }

            return AiDiaryResponseDto.builder()
                    .sttResult(sttResult)
                    .gptResult(gptResult)
                    .diaryWorkouts(diaryWorkouts)
                    .unrecognizedWorkouts(unrecognizedWorkouts)
                    .invalidInput(diaryWorkouts.isEmpty())
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("❌ AI 일지 생성 실패: " + e.getMessage(), e);
        }
    }
}
