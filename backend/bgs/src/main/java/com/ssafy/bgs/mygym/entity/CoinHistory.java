package com.ssafy.bgs.mygym.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "coin_histories", schema = "bgs")
@Getter
@Setter
public class CoinHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 추가 ✅
    @Column(name = "coin_history_id")
    private Integer coinHistoryId;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "amount", nullable = false)
    private Integer amount;

    @Column(name = "usage_type", nullable = false)
    private String usageType;

    @Column(name = "usage_id")
    private Integer usageId; // optional

    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = Timestamp.valueOf(LocalDateTime.now());
    }
}
