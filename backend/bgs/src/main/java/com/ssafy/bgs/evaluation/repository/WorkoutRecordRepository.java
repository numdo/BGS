package com.ssafy.bgs.evaluation.repository;

import com.ssafy.bgs.evaluation.entity.WorkoutRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkoutRecordRepository extends JpaRepository<WorkoutRecord, Integer> {

}
