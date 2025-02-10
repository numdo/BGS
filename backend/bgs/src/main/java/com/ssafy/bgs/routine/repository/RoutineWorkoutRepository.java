package com.ssafy.bgs.routine.repository;

import com.ssafy.bgs.routine.entity.RoutineWorkout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoutineWorkoutRepository extends JpaRepository<RoutineWorkout, Integer> {
    List<RoutineWorkout> findByRoutineIdAndDeletedFalse(Integer routineId);
}
