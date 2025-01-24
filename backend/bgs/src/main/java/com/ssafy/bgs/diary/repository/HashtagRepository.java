package com.ssafy.bgs.diary.repository;

import com.ssafy.bgs.diary.entity.Hashtag;
import com.ssafy.bgs.diary.entity.HashtagId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HashtagRepository extends JpaRepository<Hashtag, HashtagId> {

    List<Hashtag> findByIdDiaryId(Integer diaryId);
    void deleteAllByIdDiaryId(Integer diaryId);
}
