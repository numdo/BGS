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
                1. **운동명**은 개별 배열 항목으로 유지할 것.
                2. 각 운동 기록은 운동명과 세트 정보 배열을 포함해야 하며, 각 세트는 반드시 "weight", "reps", "time" 세 가지 필드를 모두 포함해야 합니다.
                   단, 운동 종류에 따라 해당하는 값이 없는 경우에는 null로 처리할 것:
                     - **무게와 횟수**가 필요한 운동: {"weight": <숫자>, "reps": <숫자>, "time": null}
                     - **횟수만** 필요한 운동 (예: 풀업): {"weight": null, "reps": <숫자>, "time": null}
                     - **시간**이 필요한 운동 (예: 러닝): {"weight": null, "reps": null, "time": <숫자>}
                3. **세트 처리:**  
                     - 만약 "총 X세트"라는 표현이 포함되어 있다면,  
                       a. 뒤따라 개별 세트 정보(예: "50kg10번, 60kg10번, 70kg5번")가 주어지면, 각 세트 정보를 순서대로 추출하여 배열에 추가할 것.  
                       b. 개별 세트 정보가 하나만 주어지는 경우, 해당 세트 정보를 X회 반복하여 배열에 추가할 것.
                4. 입력된 텍스트에 여러 운동이 포함되었을 경우, 누락 없이 모두 포함할 것.
                5. 운동과 관련 없는 문장이 포함되면, **"invalid_input": true** 로 설정하고,
                   "message": "운동 기록을 다시 말해주세요."를 응답할 것.
                6. 인식하지 못한 운동명은 "unrecognizedWorkouts" 배열에 추가할 것.
                
                🏋🏻‍♂️ **예제 입력 1 (동일 세트 반복):**  
                "벤치프레스 총3세트, 50kg10번씩"
                
                ✅ **예제 출력 1:**  
                {
                  "correctedText": "벤치프레스 50kg10번 (총 3세트)",
                  "invalid_input": false,
                  "workouts": [
                    {
                      "workoutName": "벤치프레스",
                      "sets": [
                        {"weight": 50, "reps": 10, "time": null},
                        {"weight": 50, "reps": 10, "time": null},
                        {"weight": 50, "reps": 10, "time": null}
                      ]
                    }
                  ],
                  "unrecognizedWorkouts": []
                }
                
                🏋🏻‍♂️ **예제 입력 2 (각 세트별 다른 값):**  
                "벤치프레스 총3세트, 50kg10번, 60kg10번, 70kg5번"
                
                ✅ **예제 출력 2:**  
                {
                  "correctedText": "벤치프레스 50kg10번, 60kg10번, 70kg5번 (총 3세트)",
                  "invalid_input": false,
                  "workouts": [
                    {
                      "workoutName": "벤치프레스",
                      "sets": [
                        {"weight": 50, "reps": 10, "time": null},
                        {"weight": 60, "reps": 10, "time": null},
                        {"weight": 70, "reps": 5, "time": null}
                      ]
                    }
                  ],
                  "unrecognizedWorkouts": []
                }
                
                🏋🏻‍♂️ **예제 입력 3 (횟수만, 두 운동 이상):**  
                "풀업 20회, 딥스 15회"
                
                ✅ **예제 출력 3:**  
                {
                  "correctedText": "풀업 20회, 딥스 15회",
                  "invalid_input": false,
                  "workouts": [
                    {
                      "workoutName": "풀업",
                      "sets": [
                        {"weight": null, "reps": 20, "time": null}
                      ]
                    },
                    {
                      "workoutName": "딥스",
                      "sets": [
                        {"weight": null, "reps": 15, "time": null}
                      ]
                    }
                  ],
                  "unrecognizedWorkouts": []
                }
                
                🏋🏻‍♂️ **예제 입력 4 (시간):**  
                "러닝 30분"
                
                ✅ **예제 출력 4:**  
                {
                  "correctedText": "러닝 30분",
                  "invalid_input": false,
                  "workouts": [
                    {
                      "workoutName": "러닝",
                      "sets": [
                        {"weight": null, "reps": null, "time": 30}
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

        log.info("🔍 GPT prompt = {}", prompt);
        return gptUtil.askChatGPT(prompt);
    }
}
