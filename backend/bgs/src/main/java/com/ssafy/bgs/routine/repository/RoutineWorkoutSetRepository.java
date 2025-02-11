package com.ssafy.bgs.routine.repository;

import com.ssafy.bgs.routine.entity.RoutineWorkoutSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoutineWorkoutSetRepository extends JpaRepository<RoutineWorkoutSet, Integer> {

    // 특정 RoutineWorkout의 세트 내역 조회 (삭제되지 않은 데이터)
    List<RoutineWorkoutSet> findByRoutineWorkoutIdAndDeletedFalse(Integer routineWorkoutId);
}
