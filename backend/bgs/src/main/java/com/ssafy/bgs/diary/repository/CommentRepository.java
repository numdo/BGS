package com.ssafy.bgs.diary.repository;

import com.ssafy.bgs.diary.dto.response.CommentResponseDto;
import com.ssafy.bgs.diary.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommentRepository extends JpaRepository<Comment, Integer> {

    @Query("SELECT new com.ssafy.bgs.diary.dto.response.CommentResponseDto(c.commentId, c.diaryId, u.nickname, c.content, c.createdAt, c.modifiedAt, c.deleted) " +
            "FROM Comment c JOIN User u ON c.userId = u.id WHERE c.diaryId = :diaryId")
    Page<CommentResponseDto> findCommentsByDiaryId(@Param("diaryId") Integer diaryId, Pageable pageable);

    Long countCommentByDiaryId(Integer diaryId);
}
