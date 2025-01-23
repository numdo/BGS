package com.ssafy.bgs.diary.repository;

import com.ssafy.bgs.diary.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Integer> {

}
