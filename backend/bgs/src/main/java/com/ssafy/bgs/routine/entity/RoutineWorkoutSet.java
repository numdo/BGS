package com.ssafy.bgs.routine.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table(name = "routine_workout_sets")
public class RoutineWorkoutSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "workout_set_id")
    private Integer workoutSetId;

    @Column(name = "workout_id", nullable = false)
    private Integer workoutId;

    // RoutineWorkout의 외래키를 단순 컬럼으로 관리
    @Column(name = "routine_workout_id", nullable = false)
    private Integer routineWorkoutId;

    @Column(name = "weight", precision = 5, scale = 2)
    private BigDecimal weight;

    @Column(name = "repetition")
    private Integer repetition;

    @Column(name = "workout_time")
    private Integer workoutTime;

    // 기본값 CURRENT_TIMESTAMP는 DDL에서 처리되므로, JPA에서는 기본값 설정 없이 컬럼 정의만 합니다.
    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @Column(name = "modified_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime modifiedAt;

    // tinyint(1) → Boolean, 기본값 0 (false)
    @Column(name = "deleted", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean deleted;
}
