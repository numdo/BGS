package com.ssafy.bgs.diary.repository;

import com.ssafy.bgs.diary.entity.DiaryLiked;
import com.ssafy.bgs.diary.entity.DiaryLikedId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiaryLikedRepository extends JpaRepository<DiaryLiked, DiaryLikedId> {
    long countDiaryLikedByIdDiaryId(Integer idDiaryId);
}
