package com.ssafy.bgs.evaluation.repository;

import com.ssafy.bgs.evaluation.entity.Evaluation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Integer> {
    // 삭제되지 않은 평가 조회
    Page<Evaluation> findByDeletedFalse(Pageable pageable);

    // 삭제되지 않고, 투표 완료 여부 필터링하여 조회
    Page<Evaluation> findByDeletedFalseAndClosed(boolean close, Pageable pageable);
}

