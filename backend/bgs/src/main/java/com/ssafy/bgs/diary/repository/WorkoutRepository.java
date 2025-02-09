package com.ssafy.bgs.diary.repository;

import com.ssafy.bgs.diary.entity.Workout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutRepository extends JpaRepository<Workout, Integer> {

    // 운동 이름으로 운동 검색 (부분 일치)
    List<Workout> findByWorkoutNameContainingIgnoreCase(String keyword);
}
