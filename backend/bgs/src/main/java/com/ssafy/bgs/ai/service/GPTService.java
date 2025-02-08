package com.ssafy.bgs.ai.service;

import com.ssafy.bgs.ai.util.GPTUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class GPTService {

    private final GPTUtil gptUtil;

    public String analyzeWorkout(String userText) {
        if (userText == null || userText.trim().isEmpty()) {
            log.warn("⚠️ GPT 프롬프트가 비어 있음! 기본값을 사용합니다.");
            userText = "운동 기록을 입력하세요.";
        }

        String prompt = """
                    당신은 헬스장 회사의 AI 운동 분석 도우미입니다.
                    당신의 임무는 STT로 변환된 문장의 **철자 오류, 단위 오류, 숫자 오류, 불일치**를 수정한 후,
                    올바른 운동 기록을 JSON 형식으로 변환하는 것입니다.
                    
                    ⚠️ **반드시 지킬 규칙:**
                    1. **운동명**은 하나의 문자열로 결합하지 말고, **개별 배열 항목으로 유지**할 것.
                    2. **운동명, 무게(kg), 횟수(회)**를 반드시 매칭할 것.
                    3. 만약 운동과 관련 없는 문장이라면, **"invalid_input": true** 로 설정하고,
                       "message": "운동 기록을 다시 말해주세요." 를 응답할 것.
                    4. 인식하지 못한 운동명은 "unrecognizedWorkouts" 배열에 추가할 것.
                    
                    🏋🏻‍♂️ **예제 입력:**  
                    "벤쵸프레스 60km 다섯 번 대결 리프트 100km 20번"
                    
                    ✅ **예제 출력:**  
                    {
                      "correctedText": "벤치프레스 60kg 5번, 데드리프트 100kg 20번",
                      "invalid_input": false,
                      "workouts": [
                        {
                          "workoutName": "벤치프레스",
                          "sets": [
                            {"weight": 60, "reps": 5}
                          ]
                        },
                        {
                          "workoutName": "데드리프트",
                          "sets": [
                            {"weight": 100, "reps": 20}
                          ]
                        }
                      ],
                      "unrecognizedWorkouts": []
                    }

                    🛑 **운동과 관련 없는 말이 들어온 경우 예제 출력:**  
                    {
                      "correctedText": "오늘 날씨가 너무 좋아요!",
                      "invalid_input": true,
                      "message": "운동 기록을 다시 말해주세요.",
                      "workouts": [],
                      "unrecognizedWorkouts": []
                    }
                    
                    📌 **사용자 입력:** "%s"
                """.formatted(userText);

        log.info("🔍 GPT prompt = {}", userText);
        return gptUtil.askChatGPT(prompt);
    }
}