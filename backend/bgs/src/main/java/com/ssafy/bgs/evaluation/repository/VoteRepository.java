package com.ssafy.bgs.evaluation.repository;

import com.ssafy.bgs.evaluation.entity.Vote;
import com.ssafy.bgs.evaluation.entity.VoteId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VoteRepository extends JpaRepository<Vote, VoteId> {
    // 특정 평가 게시물의 전체 투표 수
    long countByEvaluationId(Integer evaluationId);

    // 특정 평가 게시물의 찬성표 수
    long countByEvaluationIdAndApprovalTrue(Integer evaluationId);

    long countByUserId(Integer userId);
}
