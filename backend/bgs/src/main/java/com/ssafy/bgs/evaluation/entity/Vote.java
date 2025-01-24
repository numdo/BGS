package com.ssafy.bgs.evaluation.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "votes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(VoteId.class)
public class Vote {

    @Id
    @Column(name = "evaluation_id", nullable = false)
    private Integer evaluationId;

    @Id
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(nullable = false)
    private Boolean approval;
}
