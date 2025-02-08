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

            // 2️⃣ GPT 분석 (STT 결과 보정 후 JSON 변환)
            String gptResult = gptService.analyzeWorkout(sttResult);

            // 3️⃣ JSON 파싱
            JsonNode root = objectMapper.readTree(gptResult);
            JsonNode workoutsNode = root.path("workouts");

            List<DiaryWorkoutRequestDto> diaryWorkouts = new ArrayList<>();
            List<String> unrecognizedWorkouts = new ArrayList<>(); // ❌ DB에 없는 운동 저장

            for (JsonNode workoutNode : workoutsNode) {
                String workoutName = workoutNode.path("workoutName").asText();
                JsonNode setsNode = workoutNode.path("sets");

                // 4️⃣ Workout ID 매칭 (DB에서 찾기)
                Optional<Integer> matchedWorkoutId = workoutMatchingService.findBestMatchingWorkoutId(workoutName);
                if (matchedWorkoutId.isEmpty()) {
                    unrecognizedWorkouts.add(workoutName); // ❌ DB에 없는 운동은 따로 저장
                    continue;
                }

                DiaryWorkoutRequestDto workoutReq = new DiaryWorkoutRequestDto();
                workoutReq.setWorkoutId(matchedWorkoutId.get()); // ✅ Workout ID 추가
                workoutReq.setDeleted(false);

                List<WorkoutSetRequestDto> setList = new ArrayList<>();
                for (JsonNode setNode : setsNode) {
                    WorkoutSetRequestDto ws = new WorkoutSetRequestDto();
                    ws.setWeight((float) setNode.path("weight").asDouble());
                    ws.setRepetition(setNode.path("reps").asInt());
                    ws.setWorkoutTime(0); // 필요 시 시간 추가
                    setList.add(ws);
                }

                workoutReq.setSets(setList);
                diaryWorkouts.add(workoutReq);
            }

            // ✅ workoutId까지 포함하여 응답
            return AiDiaryResponseDto.builder()
                    .sttResult(sttResult)
                    .gptResult(gptResult)
                    .diaryWorkouts(diaryWorkouts) // 🚀 여러 운동 포함
                    .unrecognizedWorkouts(unrecognizedWorkouts) // 🚨 DB에 없는 운동 추가
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("AI 일지 생성 실패: " + e.getMessage(), e);
        }
    }

}
