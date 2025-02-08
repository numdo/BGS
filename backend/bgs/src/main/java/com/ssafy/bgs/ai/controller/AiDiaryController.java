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
            // 1) 인증(토큰) 확인
            if (authentication == null || authentication.getName() == null) {
                log.warn("❌ 인증되지 않은 사용자 요청!");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("{ \"message\": \"로그인이 필요합니다.\" }");
            }

            // 2) 토큰에서 userId 추출
            //    (주의: JWT 토큰의 subject에 사용자의 ID(숫자형 문자열)가 들어있어야 합니다.)
            Integer userId;
            try {
                userId = Integer.parseInt(authentication.getName());
            } catch (NumberFormatException ex) {
                log.error("❌ 인증 토큰에서 userId 파싱 실패: {}", authentication.getName());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("{ \"message\": \"유효하지 않은 사용자 정보입니다.\" }");
            }
            log.info("🎙 STT 요청 수신: userId={}, 파일명={}", userId, audioFile.getOriginalFilename());

            // 3) DTO 생성
            AudioDiaryRequestDto requestDto = new AudioDiaryRequestDto();
            requestDto.setUserId(userId);
            requestDto.setAudioFile(audioFile);

            // 4) STT → GPT → DB 저장 진행
            AiDiaryResponseDto result = aiDiaryService.createDiaryFromAudio(requestDto);
            log.info("📦 STT 변환 완료: {}", result);

            // 5) 운동 인식 실패 시 (invalidInput true)
            if (result.isInvalidInput()) {
                log.warn("🚨 운동 기록 감지되지 않음! 사용자에게 재입력 요청");
                // 여기서는 400 대신 결과를 그대로 200 OK로 반환하고, 프론트에서 invalidInput 상태에 따라 안내하도록 처리할 수 있음.
                return ResponseEntity.ok(result);
            }

            // 6) 정상인 경우 200(OK) 응답
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("❌ STT 처리 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{ \"message\": \"STT 처리 실패. 다시 시도해주세요.\" }");
        }
    }
}
