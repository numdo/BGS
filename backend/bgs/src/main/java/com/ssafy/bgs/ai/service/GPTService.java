package com.ssafy.bgs.ai.service;

import com.ssafy.bgs.ai.util.GPTUtil;
import com.ssafy.bgs.stat.dto.response.WorkoutBalanceResponseDto;
import com.ssafy.bgs.stat.dto.response.PartVolumeResponseDto;
import com.ssafy.bgs.stat.dto.response.WorkoutRecordResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

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
                1. **운동명 처리:**  
                   - 입력 문장에 포함된 모든 운동명을 개별 배열 항목으로 누락 없이 추출합니다.
                   - 동일 운동명이 여러 번 등장하면, 모든 세트 정보를 하나의 항목으로 합칩니다.
                2. **세트 정보 구성:**  
                   - 각 운동 항목은 "workoutName"과 "sets" 배열을 포함해야 하며, 각 세트는 반드시 "weight", "reps", "time" (시간은 분 단위, smallint)을 포함합니다.
                   - 운동 종류에 따라 필요한 값이 없는 경우에는 해당 필드를 null로 처리합니다.
                     - 무게+횟수 운동: {"weight": <숫자>, "reps": <숫자>, "time": null}
                     - 횟수만 필요한 운동 (예: 풀업): {"weight": null, "reps": <숫자>, "time": null}
                     - 시간 운동 (예: 러닝): {"weight": null, "reps": null, "time": <숫자>}
                3. **세트 정보 파싱:**  
                   - "총 X세트"라는 표현이 있으면, X값을 파악하여 세트 수를 결정합니다.
                     a. 개별 세트 정보가 여러 개 주어지는 경우 (예: "50kg10번, 60kg10번, 70kg5번")는 순서대로 배열에 추가합니다.
                     b. 단일 세트 정보가 주어지고 "X세트"가 명시된 경우 (예: "50kg10번씩")에는 해당 세트 정보를 X회 반복하여 추가합니다.
                   - 세트 정보는 콤마, 세미콜론, 공백, "와", "및" 등 다양한 구분자로 분리될 수 있음을 고려합니다.
                4. **단위 및 숫자 처리:**  
                   - 무게 단위는 "kg", "Kg", "KG" 등으로 주어지며, 모두 동일하게 인식합니다.
                   - 반복 횟수는 "회", "번" 등으로 표기될 수 있으며, 숫자만 추출합니다.
                   - 시간은 "분"과 "초" 단위로 주어질 수 있는데, 반드시 분 단위로 환산합니다.
                     - 만약 초 단위가 입력되면, 60으로 나눈 후 반올림하여 분으로 변환합니다.
                5. **숫자 및 오타 보정:**  
                   - 숫자가 한글(예: "삼십", "다섯")으로 표현된 경우 아라비아 숫자로 변환합니다.
                   - 숫자와 단위 사이의 불필요한 공백 및 특수문자를 제거합니다.
                6. **복합 및 혼합 운동 처리:**  
                   - "스쿼트+데드리프트" 또는 "벤치프레스 후 데드리프트"와 같이 결합된 운동은 각각 개별 운동으로 분리해서 처리합니다.
                7. **불완전/누락 정보 처리:**  
                   - 세트 정보 중 일부 필드가 누락되면 해당 필드는 null로 처리합니다.
                   - 세트 정보가 전혀 없는 경우 또는 운동과 무관한 문장이 섞여 있으면, **"invalid_input": true** 로 설정하고,
                     "message": "운동 기록을 다시 말해주세요."를 반환합니다.
                8. **알 수 없는 운동:**  
                   - 인식하지 못한 운동명은 "unrecognizedWorkouts" 배열에 추가합니다.
                
                📌 **주의:** 위 규칙들을 모두 고려하여, 가능한 모든 변수(다양한 구분자, 단위 표기, 숫자 형식, 중복 및 복합 운동, 초/분 변환 등)를 처리해야 합니다.
                
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
                
                🏋🏻‍♂️ **예제 입력 4 (시간 단위 변환):**  
                "러닝 90초"
                
                ✅ **예제 출력 4:**  
                {
                  "correctedText": "러닝 90초 (약 2분)",
                  "invalid_input": false,
                  "workouts": [
                    {
                      "workoutName": "러닝",
                      "sets": [
                        {"weight": null, "reps": null, "time": 2}
                      ]
                    }
                  ],
                  "unrecognizedWorkouts": []
                }
                
                🏋🏻‍♂️ **예제 입력 5 (복합/혼합 운동 및 한글 숫자):**  
                "스쿼트+데드리프트, 벤치프레스 후 데드리프트, 삼십kg 다섯 번씩, 60kg10번"
                
                ✅ **예제 출력 5:**  
                {
                  "correctedText": "스쿼트, 데드리프트, 벤치프레스, 데드리프트, 30kg 5번, 60kg10번",
                  "invalid_input": false,
                  "workouts": [
                    {
                      "workoutName": "스쿼트",
                      "sets": [
                        {"weight": null, "reps": null, "time": null}
                      ]
                    },
                    {
                      "workoutName": "데드리프트",
                      "sets": [
                        {"weight": null, "reps": null, "time": null}
                      ]
                    },
                    {
                      "workoutName": "벤치프레스",
                      "sets": [
                        {"weight": 30, "reps": 5, "time": null}
                      ]
                    },
                    {
                      "workoutName": "데드리프트",
                      "sets": [
                        {"weight": 60, "reps": 10, "time": null}
                      ]
                    }
                  ],
                  "unrecognizedWorkouts": []
                }
                
                🛑 **운동과 관련 없는 문장이 포함된 경우 예제 출력:**  
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

    public String analyzeComprehensive(
            WorkoutBalanceResponseDto balance,
            Map<String, PartVolumeResponseDto> partVolume, // thisWeek, lastWeek, twoWeeksAgo
            WorkoutRecordResponseDto record,
            Double recentWeight,   // 혹은 List<WeightHistory>
            Double userHeight,
            Integer userAge
    ) {
        String prompt = buildComprehensivePrompt(
                balance, partVolume, record, recentWeight, userHeight, userAge
        );

        log.info("🔍 GPT analyzeComprehensive prompt = {}", prompt);
        return gptUtil.askChatGPT(prompt);
    }

    private String buildComprehensivePrompt(
            WorkoutBalanceResponseDto balance,
            Map<String, PartVolumeResponseDto> partVolume,
            WorkoutRecordResponseDto record,
            Double recentWeight,
            Double userHeight,
            Integer userAge
    ) {
        // partVolume에 "thisWeek", "lastWeek", "twoWeeksAgo" 등이 들어있고,
        // 각 value는 chest, lat, shoulder, biceps, triceps, leg 등을 가짐.

        // 1) 밸런스: chest, lat, triceps, leg, biceps, shoulder...
        // 2) 3대 운동: bench, dead, squat
        // 3) partVolume: thisWeek, lastWeek, twoWeeksAgo
        // 4) recentWeight, userHeight, userAge

        // 편의상, partVolume["thisWeek"] 등만 예시로 보여줍니다.
        PartVolumeResponseDto thisWeek = partVolume.get("thisWeek");
        PartVolumeResponseDto lastWeek = partVolume.get("lastWeek");
        PartVolumeResponseDto twoWeeksAgo = partVolume.get("twoWeeksAgo");

        // 아래는 예시 프롬프트. 실제로는 원하는 질문/지시사항을 적절히 작성하세요.
        return """
                당신은 헬스 트레이너 AI입니다.
                사용자의 기본 정보:
                - 나이: %d세
                - 키: %.1fcm
                - 현재 몸무게: %.1fkg

                3대 운동 기록 (최고 중량):
                - 벤치프레스: %.1fkg
                - 데드리프트: %.1fkg
                - 스쿼트: %.1fkg

                최근 3주간 부위별 운동량(볼륨):
                - 이번주: 가슴=%d, 등=%d, 어깨=%d, 이두=%d, 삼두=%d, 하체=%d
                - 저번주: 가슴=%d, 등=%d, 어깨=%d, 이두=%d, 삼두=%d, 하체=%d
                - 2주전:  가슴=%d, 등=%d, 어깨=%d, 이두=%d, 삼두=%d, 하체=%d

                전반적인 운동 밸런스 (0~100%%):
                - 가슴: %d
                - 등: %d
                - 삼두: %d
                - 이두: %d
                - 어깨: %d
                - 하체: %d

                위 데이터를 바탕으로:
                1) 현재 운동 루틴에 대한 평가 (부족/과잉 부위)
                2) 3대 운동 기록 대비 발전 방향
                3) 체중과 키, 나이를 고려한 식단/유산소/보조운동 제안
                4) 200자 이내의 간단한 한국어 문장으로 작성
                
                """.formatted(
                userAge != null ? userAge : 0,
                userHeight != null ? userHeight : 0.0,
                recentWeight != null ? recentWeight : 0.0,

                record.getBench(),
                record.getDead(),
                record.getSquat(),

                thisWeek.getChest(), thisWeek.getLat(), thisWeek.getShoulder(),
                thisWeek.getBiceps(), thisWeek.getTriceps(), thisWeek.getLeg(),

                lastWeek.getChest(), lastWeek.getLat(), lastWeek.getShoulder(),
                lastWeek.getBiceps(), lastWeek.getTriceps(), lastWeek.getLeg(),

                twoWeeksAgo.getChest(), twoWeeksAgo.getLat(), twoWeeksAgo.getShoulder(),
                twoWeeksAgo.getBiceps(), twoWeeksAgo.getTriceps(), twoWeeksAgo.getLeg(),

                balance.getChest(),
                balance.getLat(),
                balance.getTriceps(),
                balance.getBiceps(),
                balance.getShoulder(),
                balance.getLeg()
        );
    }
}
