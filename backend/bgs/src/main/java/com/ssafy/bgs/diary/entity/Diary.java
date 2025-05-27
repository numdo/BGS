package com.ssafy.bgs.diary.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;

import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "diaries", schema = "bgs")
@Getter
@Setter
public class Diary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer diaryId;

    @Column
    private Integer userId;
    @Column
    private Date workoutDate;
    @Column
    private String content;
    @Column
    private String allowedScope;
    @CreatedDate
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
