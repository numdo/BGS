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

    @Column(name = "created_at", updatable = false, insertable = false)
    private Instant createdAt;

    @Column(name = "modified_at", insertable = false)
    private Instant modifiedAt;

    @ColumnDefault("0")
    @Column(name = "deleted")
    private Boolean deleted;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        if (this.modifiedAt == null) {
            this.modifiedAt = Instant.now();
        }
        if(this.degree==null){
            this.degree = BigDecimal.valueOf(36.5);
        }
        if(this.totalWeight==null){
            this.totalWeight = BigDecimal.valueOf(0);
        }
        if (this.coin == null) { // coin의 기본값 설정
            this.coin = 0;
        }
        if (this.deleted == null) { // deleted의 기본값 설정
            this.deleted = false;
        }
        if (this.strickAttendance == null) { // strickAttendance의 기본값 설정
            this.strickAttendance = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.modifiedAt = Instant.now();
    }
}
