package com.ssafy.bgs.evaluation.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "evaluation_comments", schema = "bgs")
@Getter
@Setter
public class EvaluationComment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer EvaluationCommentId;

    @Column
    private Integer userId;
    @Column
    private Integer evaluationId;
    @Column
    private String content;
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
