package com.ssafy.bgs.stat.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "weight_histories", schema = "bgs")
public class WeightHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "weight_history_id")
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "weight", nullable = false)
    private Double weight;

    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Timestamp.valueOf(LocalDateTime.now());
    }
}
