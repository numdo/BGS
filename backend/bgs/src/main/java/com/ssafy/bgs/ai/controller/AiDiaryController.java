package com.ssafy.bgs.ai.controller;

import com.ssafy.bgs.ai.dto.request.AudioDiaryRequestDto;
import com.ssafy.bgs.ai.dto.response.AiDiaryResponseDto;
import com.ssafy.bgs.ai.service.AiDiaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/ai-diary")
@RequiredArgsConstructor
@Slf4j
public class AiDiaryController {

    private final AiDiaryService aiDiaryService;

    /**
     * 사용자가 녹음한 오디오 + userId를 전송하면
     * STT → GPT → workout DB 매핑 → DiaryService로 자동 저장
     */
    @PostMapping("/auto")
    public ResponseEntity<?> createDiaryFromAudio(
            @RequestParam("userId") Integer userId,
            @RequestParam("audioFile") MultipartFile audioFile
    ) {
        try {
            log.info("🎙 STT 요청 수신: userId={}, 파일명={}", userId, audioFile.getOriginalFilename());

            // DTO 생성
            AudioDiaryRequestDto requestDto = new AudioDiaryRequestDto();
            requestDto.setUserId(userId);
            requestDto.setAudioFile(audioFile);

            // STT → GPT → DB 저장 진행
            AiDiaryResponseDto result = aiDiaryService.createDiaryFromAudio(requestDto);

            // 🚨 STT 결과 확인
            log.info("📦 STT 변환 완료: {}", result);

            // 🚨 사용자가 운동과 관련 없는 말을 한 경우
            if (result.isInvalidInput()) {
                log.warn("🚨 운동 기록 감지되지 않음! 사용자에게 재입력 요청");
                return ResponseEntity.badRequest().body(
                        "{ \"message\": \"운동 기록을 다시 말씀해주세요.\" }"
                );
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("❌ STT 처리 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{ \"message\": \"STT 처리 실패. 다시 시도해주세요.\" }");
        }
    }
}
