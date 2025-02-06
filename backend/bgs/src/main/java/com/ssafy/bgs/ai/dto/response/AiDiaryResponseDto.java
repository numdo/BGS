package com.ssafy.bgs.ai.dto.response;

import com.ssafy.bgs.diary.dto.request.DiaryWorkoutRequestDto;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * AI가 분석한 운동 데이터 + Diary에 저장된 결과(예: diaryId)를 반환
 */
@Getter
@Builder
public class AiDiaryResponseDto {
    private String sttResult;   // STT 결과 (ex. "벤치프레스 50kg 5번 ...")
    private String gptResult;   // GPT 분석 결과 (JSON 등)
    private List<DiaryWorkoutRequestDto> diaryWorkouts;
    private List<String> unrecognizedWorkouts; // ❗ DB에 없는 운동 목록 추가

    public static AiDiaryResponseDto of(String sttResult, String gptResult,
                                        List<DiaryWorkoutRequestDto> diaryWorkouts,
                                        List<String> unrecognizedWorkouts) { // 🚀 수정
        return AiDiaryResponseDto.builder()
                .sttResult(sttResult)
                .gptResult(gptResult)
                .diaryWorkouts(diaryWorkouts)
                .unrecognizedWorkouts(unrecognizedWorkouts) // ✅ 추가
                .build();
    }
}
