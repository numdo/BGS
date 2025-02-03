package com.ssafy.bgs.mygym.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "items", schema = "bgs")
@Getter
@Setter
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer itemId;

    @Column
    private String itemName;
    @Column
    private Integer width;
    @Column
    private Integer height;
    @Column
    private Integer price;
    @Column
    private Boolean usable;
    @Column
    private Timestamp createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = Timestamp.valueOf(LocalDateTime.now());
        usable = true;
    }
}
