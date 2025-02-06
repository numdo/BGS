package com.ssafy.bgs.ai.service;

import com.ssafy.bgs.ai.util.SpeechToTextUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class SpeechToTextService {

    private final SpeechToTextUtil speechToTextUtil;

    public String transcribe(MultipartFile audioFile) {
        try {
            String result = speechToTextUtil.googleSpeechToText(audioFile);
            log.info("🎙 STT 변환 결과: {}", result);

            if (result == null || result.trim().isEmpty()) {
                log.warn("⚠️ STT 변환 실패 - 빈 문자열 반환됨");
                return "STT 변환 실패: 음성을 인식하지 못했습니다.";
            }

            return result;
        } catch (Exception e) {
            log.error("❌ STT 변환 중 오류 발생", e);
            return "STT 변환 오류: " + e.getMessage();
        }
    }

}
