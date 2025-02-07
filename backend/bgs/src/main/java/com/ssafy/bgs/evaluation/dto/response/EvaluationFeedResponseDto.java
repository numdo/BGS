package com.ssafy.bgs.evaluation.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EvaluationFeedResponseDto {
    private Integer evaluationId;
    private String imageUrl;
    private Long voteCount;
    private Long approvalCount;
}
