package com.ssafy.bgs.evaluation.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;
import java.util.List;

@Getter
@Setter
@Builder
public class EvaluationResponseDto {

    private Integer evaluationId; // 평가 ID
    private Integer userId;       // 작성자 ID
    private String profileImageUrl;
    private String writer;
    private String content;       // 게시물 내용
    private Double weight;        // 인증받을 무게
    private String workoutType;   // SQUAT, BENCH, DEAD
    private Boolean opened;       // 투표 시작 여부
    private Boolean closed;       // 투표 종료 여부
    private Timestamp createdAt;  // 생성 일자
    private Timestamp modifiedAt; // 수정 일자
    private Boolean deleted;      // 삭제 여부
    // 이미지 URL 목록 추가
    @Builder.Default
    private List<String> imageUrls = List.of(); // 기본값: 빈 리스트
}
