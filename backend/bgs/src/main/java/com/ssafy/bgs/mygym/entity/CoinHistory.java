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
    private Integer coinHistoryId;

    @Column
    private Integer userId;
    @Column
    private Integer coin;
    @Column
    private String usageType;
    @Column
    private Integer usageId;
    @Column
    private Timestamp createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = Timestamp.valueOf(LocalDateTime.now());
    }
}
