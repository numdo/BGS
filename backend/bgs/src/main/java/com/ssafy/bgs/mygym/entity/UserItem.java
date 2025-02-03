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
public class UserItem {
    @EmbeddedId
    private UserItemId id;

    @Column
    private String itemName;
    @Column
    private Integer itemPrice;
    @Column
    private Timestamp createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = Timestamp.valueOf(LocalDateTime.now());
    }
}
