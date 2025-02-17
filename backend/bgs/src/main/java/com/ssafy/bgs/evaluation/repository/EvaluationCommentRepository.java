package com.ssafy.bgs.evaluation.repository;

import com.ssafy.bgs.diary.dto.response.CommentResponseDto;
import com.ssafy.bgs.evaluation.entity.EvaluationComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EvaluationCommentRepository extends JpaRepository<EvaluationComment, Integer> {

    @Query("SELECT new com.ssafy.bgs.diary.dto.response.CommentResponseDto(c.EvaluationCommentId, c.evaluationId, u.nickname, c.content, c.createdAt, c.modifiedAt, c.deleted) " +
            "FROM EvaluationComment c JOIN User u ON c.userId = u.id WHERE c.evaluationId = :evaluationId")
    List<CommentResponseDto> findCommentsByEvaluationId(@Param("evaluationId") Integer evaluationId);
}
