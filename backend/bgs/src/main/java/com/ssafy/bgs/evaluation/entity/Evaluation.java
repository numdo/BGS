package com.ssafy.bgs.evaluation.entity;

import jakarta.persistence.*;
import lombok.*;
import java.sql.Timestamp;

@Entity
@Table(name = "evaluations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "evaluation_id")
    private Integer evaluationId;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Lob
    private String content;

    private Double weight;

    @Column(name = "workout_type", length = 5)
    private String workoutType;   // 예: SQUAT, BENCH, DEAD

    private Boolean opened;
    private Boolean closed;

    @Column(name = "created_at")
    private Timestamp createdAt;

    @Column(name = "modified_at")
    private Timestamp modifiedAt;

    private Boolean deleted;
}
