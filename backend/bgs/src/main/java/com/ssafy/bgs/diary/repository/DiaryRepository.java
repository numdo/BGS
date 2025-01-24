package com.ssafy.bgs.diary.repository;

import com.ssafy.bgs.diary.entity.Diary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.sql.Date;

@Repository
public interface DiaryRepository extends JpaRepository<Diary, Integer> {

    Page<Diary> findByUserIdAndWorkoutDateAndDeletedFalse(Integer userId, Date workoutDate, Pageable pageable);
    Page<Diary> findByUserIdAndDeletedFalse(Integer userId, Pageable pageable);
    Page<Diary> findByWorkoutDateAndDeletedFalse(Date workoutDate, Pageable pageable);
    Page<Diary> findByDeletedFalse(Pageable pageable);
}
