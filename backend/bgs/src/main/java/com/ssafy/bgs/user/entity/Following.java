package com.ssafy.bgs.user.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "following")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Following {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // following 테이블에 auto_increment PK가 필요하다면 추가 (다만 DB 구조가 복합키면 다르게 처리)
    // 하지만 지금은 PK가 follower_id, foloowee_id가 될 수도 있으므로, 편의상 별도 ID 컬럼으로 예시 구현
    @Column(name = "id")
    private Integer id;

    @Column(name = "follower_id", nullable = false)
    private Integer followerId; // 팔로우를 건 사람(팔로워)

    @Column(name = "followee_id", nullable = false)
    private Integer followeeId; // 팔로우 대상(피팔로우)
}
