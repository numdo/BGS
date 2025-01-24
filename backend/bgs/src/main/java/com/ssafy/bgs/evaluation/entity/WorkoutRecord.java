package com.ssafy.bgs.evaluation.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "workout_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkoutRecord {

    @Id
    @Column(name = "user_id")
    private Integer userId; // 회원 ID

    @Column(name = "squat_evaluation")
    private Integer squatEvaluation; // 스쿼트 최대 중량 근거 평가글 ID

    @Column(name = "benchpress_evaluation")
    private Integer benchpressEvaluation; // 벤치프레스 최대 중량 근거 평가글 ID

    @Column(name = "deadlift_evaluation")
    private Integer deadliftEvaluation; // 데드리프트 최대 중량 근거 평가글 ID

    @Column(nullable = false)
    private Double squat = 0.0;

    @Column(nullable = false)
    private Double benchpress = 0.0;

    @Column(nullable = false)
    private Double deadlift = 0.0;
}
