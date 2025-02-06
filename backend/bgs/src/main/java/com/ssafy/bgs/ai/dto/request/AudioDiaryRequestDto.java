package com.ssafy.bgs.ai.dto.request;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

/**
 * 음성으로 일지를 작성하기 위한 DTO
 */
@Getter
@Setter
public class AudioDiaryRequestDto {
    private Integer userId;           // 로그인 사용자 ID
    private MultipartFile audioFile;  // 클라이언트에서 전송하는 녹음 파일
}
