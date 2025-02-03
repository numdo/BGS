package com.ssafy.bgs.user.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Getter
@Setter
@Entity
@Table(name = "users", schema = "bgs")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id", nullable = false)
    private Integer id;

    @Column(name = "account_type")
    private AccountType accountType;

    @Column(name = "social_id")
    private Long socialId;

    @Column(name = "email", length = 128)
    private String email;

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

    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @Column(name = "modified_at")
    private Timestamp modifiedAt;

    @ColumnDefault("0")
    @Column(name = "deleted")
    private Boolean deleted;

    @PrePersist
    protected void onCreate() {
        // Asia/Seoul 기준의 로컬 시간으로 설정
        this.createdAt = Timestamp.valueOf(LocalDateTime.now());
        this.modifiedAt = Timestamp.valueOf(LocalDateTime.now());
        if (this.degree == null) {
            this.degree = BigDecimal.valueOf(36.5);
        }
        if (this.totalWeight == null) {
            this.totalWeight = BigDecimal.ZERO;
        }
        if (this.coin == null) {
            this.coin = 0;
        }
        if (this.deleted == null) {
            this.deleted = false;
        }
        if (this.strickAttendance == null) {
            this.strickAttendance = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.modifiedAt = Timestamp.valueOf(LocalDateTime.now());
    }
}
