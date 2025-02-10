package com.ssafy.bgs.routine.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table(name = "routines")
public class Routine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "routine_id")
    private Integer routineId;

    @Column(name = "routine_name", nullable = false, length = 64)
    private String routineName;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "modified_at")
    private LocalDateTime modifiedAt;

    // tinyint(1) 컬럼을 Boolean으로 매핑 (null 허용)
    @Column(name = "deleted")
    private Boolean deleted;

    @Column(name = "user_id")
    private Integer userId;
}
