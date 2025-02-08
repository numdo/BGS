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

    /**
     * 예:
     * "문장에서 운동명과 세트 정보를 JSON 형식으로 추출해줘."
     */
    public String analyzeWorkout(String userText) {
        if (userText == null || userText.trim().isEmpty()) {
            log.warn("⚠️ GPT 프롬프트가 비어 있음! 기본값을 사용합니다.");
            userText = "운동 기록을 입력하세요.";
        }

        String prompt = """
         당신은 헬스장 회사의 유용한 어시스턴트입니다.
         당신의 임무는 STT로 필사된 텍스트의 철자 오류, 어색한 말, 숫자 오류, 불일치를 수정하는 것입니다.
         그 후, 수정된 문장을 기반으로 운동 기록을 JSON 형식으로 변환하세요.
       \s
         예제 입력:
         "벤쵸프레스 60km 다섯 번 대결 리프트 100km 20번"
       \s
         예제 출력:
         {
           "correctedText": "벤치프레스 60kg 5번, 데드리프트 100kg 20번",
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
           ]
         }
        운동명을 합쳐서 "벤치프레스데드리프트"처럼 만들지 말고,
        반드시 운동별로 배열에 나눠 담아줘.
        무게 단위는 kg로 추출해줘. 문장: %s
        """.formatted(userText);

        log.info("🔍 GPT prompt = {}", userText);
        return gptUtil.askChatGPT(prompt);
    }


}
