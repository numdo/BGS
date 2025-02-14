package com.ssafy.bgs.diary.repository;

import com.ssafy.bgs.diary.entity.WorkoutSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.util.List;

@Repository
public interface WorkoutSetRepository extends JpaRepository<WorkoutSet, Integer> {

    List<WorkoutSet> findByDiaryWorkoutIdAndDeletedFalse(Integer diaryWorkoutId);

    @Query(value = """
    SELECT w.part, SUM(ws.weight * ws.repetition) AS totalVolume
    FROM diaries d
    JOIN diary_workouts dw ON d.diary_id = dw.diary_id
    JOIN workout_sets ws ON dw.diary_workout_id = ws.diary_workout_id
    JOIN workouts w ON dw.workout_id = w.workout_id
    WHERE d.deleted = false
    AND dw.deleted = false
    AND ws.deleted = false
    AND d.user_id = :userId
    AND d.workout_date BETWEEN :startDate AND :endDate
    GROUP BY w.part
    """, nativeQuery = true)
    List<Object[]> findWorkoutVolumeByPart(@Param("userId") Integer userId,
                                           @Param("startDate") Date startDate,
                                           @Param("endDate") Date endDate);


}
