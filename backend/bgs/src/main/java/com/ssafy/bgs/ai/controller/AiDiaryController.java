package com.ssafy.bgs.ai.controller;

import com.ssafy.bgs.ai.dto.request.AudioDiaryRequestDto;
import com.ssafy.bgs.ai.dto.response.AiDiaryResponseDto;
import com.ssafy.bgs.ai.service.AiDiaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ai-diary")
@RequiredArgsConstructor
@Slf4j
public class AiDiaryController {

    private final AiDiaryService aiDiaryService;

    /**
     * 사용자가 녹음한 오디오를 전송하면
     * STT → GPT → workout DB 매핑 → DiaryService로 자동 저장
     */
    @PostMapping("/auto")
    public ResponseEntity<?> createDiaryFromAudio(
            Authentication authentication,
            @RequestParam("audioFile") MultipartFile audioFile
    ) {
        try {
            if (authentication == null || authentication.getName() == null) {
                log.warn("❌ 인증되지 않은 사용자 요청!");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("{ \"message\": \"로그인이 필요합니다.\" }");
            }

            // 🔥 토큰에서 userId 가져오기
            Integer userId = Integer.parseInt(authentication.getName());
            log.info("🎙 STT 요청 수신: userId={}, 파일명={}", userId, audioFile.getOriginalFilename());

            // DTO 생성
            AudioDiaryRequestDto requestDto = new AudioDiaryRequestDto();
            requestDto.setUserId(userId);
            requestDto.setAudioFile(audioFile);

            // STT → GPT → DB 저장 진행
            AiDiaryResponseDto result = aiDiaryService.createDiaryFromAudio(requestDto);

            log.info("📦 STT 변환 완료: {}", result);

            // 🚨 운동을 인식하지 못한 경우
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
