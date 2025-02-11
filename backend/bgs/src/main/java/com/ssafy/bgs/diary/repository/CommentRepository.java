package com.ssafy.bgs.diary.repository;

import com.ssafy.bgs.diary.dto.response.CommentResponseDto;
import com.ssafy.bgs.diary.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Integer> {

    @Query("SELECT new com.ssafy.bgs.diary.dto.response.CommentResponseDto(c.commentId, c.diaryId, u.nickname, c.content, c.createdAt, c.modifiedAt, c.deleted) " +
            "FROM Comment c JOIN User u ON c.userId = u.id WHERE c.diaryId = :diaryId")
    List<CommentResponseDto> findCommentsByDiaryId(@Param("diaryId") Integer diaryId);

    Long countCommentByDiaryId(Integer diaryId);
}
