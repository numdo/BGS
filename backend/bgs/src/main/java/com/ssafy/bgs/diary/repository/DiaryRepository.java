package com.ssafy.bgs.diary.repository;

import com.ssafy.bgs.diary.entity.Diary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.sql.Date;

@Repository
public interface DiaryRepository extends JpaRepository<Diary, Integer> {

    Page<Diary> findByUserIdAndWorkoutDate(Integer userId, Date workoutDate, Pageable pageable);
    Page<Diary> findByUserId(Integer userId, Pageable pageable);
    Page<Diary> findByWorkoutDate(Date workoutDate, Pageable pageable);


}
