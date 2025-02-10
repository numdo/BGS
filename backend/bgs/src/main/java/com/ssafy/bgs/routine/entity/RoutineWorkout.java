package com.ssafy.bgs.routine.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table(name = "routine_workout")
public class RoutineWorkout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "routine_workout_id")
    private Integer routineWorkoutId;

    // 운동 아이디 : smallint → Short 사용
    @Column(name = "workout_id", nullable = false)
    private Short workoutId;

    // 루틴 아이디 (Routine과의 연관관계를 끊고 단순 컬럼으로 관리)
    @Column(name = "routine_id", nullable = false)
    private Integer routineId;

    // tinyint 컬럼 → Integer (Day 번호, 순서 등)
    @Column(name = "routine_workout_day")
    private Integer routineWorkoutDay;

    @Column(name = "routine_workout_order")
    private Integer routineWorkoutOrder;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "modified_at")
    private LocalDateTime modifiedAt;

    // tinyint(1) → Boolean
    @Column(name = "deleted")
    private Boolean deleted;
}
