package com.ssafy.bgs.diary.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "diary_workouts", schema = "bgs")
@Getter
@Setter
public class DiaryWorkout {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer diaryWorkoutId;

    @Column
    private Integer diaryId;
    @Column
    private Integer workoutId;
    @Column
    private Integer setSum;
    @Column
    private Timestamp createdAt;
    @Column
    private Timestamp modifiedAt;
    @Column
    private Boolean deleted;

    @PrePersist
    public void prePersist() {
        createdAt = Timestamp.valueOf(LocalDateTime.now());
        modifiedAt = Timestamp.valueOf(LocalDateTime.now());
        deleted = false;
    }

    @PreUpdate
    public void preUpdate() {
        modifiedAt = Timestamp.valueOf(LocalDateTime.now());
    }
}
