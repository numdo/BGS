package com.ssafy.bgs.diary.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "workout_sets", schema = "bgs")
@Getter
@Setter
public class WorkoutSet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer workoutSetId;

    @Column
    private Integer diaryWorkoutId;
    @Column
    private Float weight;
    @Column
    private Integer repetition;
    @Column
    private Integer workoutTime;
    @Column
    private Integer ordinal;
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
