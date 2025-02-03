package com.ssafy.bgs.mygym.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "places", schema = "bgs")
@Getter
@Setter
public class Place {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer placeId;

    @Column
    private Integer itemId;
    @Column
    private Integer userId;
    @Column
    private Integer x;
    @Column
    private Integer y;
    @Column
    private Boolean rotated;
    @Column
    private Timestamp createdAt;
    @Column
    private Boolean deleted;

    @PrePersist
    public void prePersist() {
        createdAt = Timestamp.valueOf(LocalDateTime.now());
        deleted = false;
    }
}
