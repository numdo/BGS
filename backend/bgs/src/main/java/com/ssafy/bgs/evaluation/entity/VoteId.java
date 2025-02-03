package com.ssafy.bgs.evaluation.entity;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VoteId implements Serializable {

    private Integer evaluationId;
    private Integer userId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        VoteId voteId = (VoteId) o;

        if (!evaluationId.equals(voteId.evaluationId)) return false;
        return userId.equals(voteId.userId);
    }

    @Override
    public int hashCode() {
        int result = evaluationId.hashCode();
        result = 31 * result + userId.hashCode();
        return result;
    }
}
