package com.ssafy.bgs.evaluation.dto.request;

import lombok.Getter;
import lombok.Setter;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Getter
@Setter
public class EvaluationRequestDto {

    @NotBlank(message = "내용은 필수입니다.")
    private String content;

    @NotNull(message = "무게는 필수입니다.")
    private Double weight;

    @NotBlank(message = "운동 유형은 필수입니다.") // 예: SQUAT, BENCH, DEAD
    private String workoutType;
}
