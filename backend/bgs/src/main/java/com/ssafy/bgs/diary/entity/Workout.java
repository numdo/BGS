package com.ssafy.bgs.diary.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "workouts", schema = "bgs")
@Getter
@Setter
public class Workout {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer workoutId;

    @Column
    private String workoutName;
    @Column
    private String part;
    @Column
    private String tool;
}
