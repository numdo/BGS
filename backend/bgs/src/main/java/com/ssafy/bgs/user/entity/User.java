package com.ssafy.bgs.user.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "users", schema = "bgs")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id", nullable = false)
    private Integer id;

    @Column(name = "kakao_id")
    private Long kakaoId;

    @Column(name = "email", length = 128)
    private String email;

    @Column(name = "login_token", length = 64)
    private String loginToken;

    @Column(name = "password")
    private String password;

    @Column(name = "name", length = 10)
    private String name;

    @Column(name = "nickname", length = 50)
    private String nickname;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "sex")
    private Character sex;

    @Column(name = "height")
    private Integer height;

    @Column(name = "weight")
    private Integer weight;

    @ColumnDefault("36.5")
    @Column(name = "degree", precision = 3, scale = 1)
    private BigDecimal degree;

    @Column(name = "introduction")
    private String introduction;

    @ColumnDefault("0.0")
    @Column(name = "total_weight", precision = 4, scale = 1)
    private BigDecimal totalWeight;

    @ColumnDefault("0")
    @Column(name = "strick_attendance")
    private Integer strickAttendance;

    @Column(name = "last_attendance")
    private LocalDate lastAttendance;

    @ColumnDefault("0")
    @Column(name = "coin")
    private Integer coin;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "modified_at")
    private Instant modifiedAt;

    @ColumnDefault("0")
    @Column(name = "deleted")
    private Boolean deleted;

}