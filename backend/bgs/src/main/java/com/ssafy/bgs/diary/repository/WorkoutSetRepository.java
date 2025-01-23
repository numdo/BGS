package com.ssafy.bgs.diary.repository;

import com.ssafy.bgs.diary.entity.WorkoutSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkoutSetRepository extends JpaRepository<WorkoutSet, Integer> {

}
