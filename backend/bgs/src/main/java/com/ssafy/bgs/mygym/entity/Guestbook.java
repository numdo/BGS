package com.ssafy.bgs.mygym.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "guestbooks", schema = "bgs")
@Getter
@Setter
public class Guestbook {
    @Id
    private Integer guestbookId;

    @Column
    private Integer ownerId;
    @Column
    private Integer guestId;
    @Column
    private String content;
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
