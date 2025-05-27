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
    private Integer userId;

    @Column(name = "squat_evaluation")
    private Integer squatEvaluation;

    @Column(name = "benchpress_evaluation")
    private Integer benchpressEvaluation;

    @Column(name = "deadlift_evaluation")
    private Integer deadliftEvaluation;

    @Column(nullable = false)
    private Double squat = 0.0;

    @Column(nullable = false)
    private Double benchpress = 0.0;

    @Column(nullable = false)
    private Double deadlift = 0.0;
}
