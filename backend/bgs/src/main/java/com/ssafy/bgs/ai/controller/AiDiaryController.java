package com.ssafy.bgs.ai.controller;

import com.ssafy.bgs.ai.dto.request.AudioDiaryRequestDto;
import com.ssafy.bgs.ai.dto.response.AiDiaryResponseDto;
import com.ssafy.bgs.ai.service.AiDiaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ai-diary")
@RequiredArgsConstructor
@CrossOrigin(origins = {"null", "http://localhost:5500"})

public class AiDiaryController {

    private final AiDiaryService aiDiaryService;

    /**
     * 사용자가 녹음한 오디오 + userId를 전송하면
     * STT → GPT → workout DB 매핑 → DiaryService로 자동 저장
     */
    @PostMapping("/auto")
    public ResponseEntity<AiDiaryResponseDto> createDiaryFromAudio(
            @RequestParam("userId") Integer userId,
            @RequestParam("audioFile") MultipartFile audioFile
    ) {
        AudioDiaryRequestDto requestDto = new AudioDiaryRequestDto();
        requestDto.setUserId(userId);
        requestDto.setAudioFile(audioFile);

        AiDiaryResponseDto result = aiDiaryService.createDiaryFromAudio(requestDto);
        return ResponseEntity.ok(result);
    }

}
