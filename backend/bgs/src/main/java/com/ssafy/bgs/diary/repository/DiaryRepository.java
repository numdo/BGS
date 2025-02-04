package com.ssafy.bgs.diary.repository;

import com.ssafy.bgs.diary.entity.Diary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DiaryRepository extends JpaRepository<Diary, Integer> {

    List<Diary> findByUserIdAndWorkoutDateBetweenAndDeletedFalse(Integer userId, LocalDate startDate, LocalDate endDate);
}
