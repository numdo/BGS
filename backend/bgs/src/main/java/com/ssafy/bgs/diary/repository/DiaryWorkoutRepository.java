package com.ssafy.bgs.diary.repository;

import com.ssafy.bgs.diary.entity.DiaryWorkout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiaryWorkoutRepository extends JpaRepository<DiaryWorkout, Integer> {

}
