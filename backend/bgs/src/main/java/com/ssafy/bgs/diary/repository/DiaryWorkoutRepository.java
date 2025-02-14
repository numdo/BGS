package com.ssafy.bgs.diary.repository;

import com.ssafy.bgs.diary.entity.DiaryWorkout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DiaryWorkoutRepository extends JpaRepository<DiaryWorkout, Integer> {

    List<DiaryWorkout> findByDiaryIdAndDeletedFalse(Integer diaryId);

    @Query("""
    SELECT w.part, COUNT(dw)
    FROM DiaryWorkout dw
    JOIN Diary d ON dw.diaryId = d.diaryId
    JOIN Workout w ON w.workoutId = dw.workoutId
    WHERE d.userId = :userId
    AND d.deleted = false
    AND dw.deleted = false
    GROUP BY w.part
""")
    List<Object[]> countByUserIdGroupedByPart(@Param("userId") Integer userId);

    @Query("""
    SELECT w.part, COUNT(dw)
    FROM DiaryWorkout dw
    JOIN Diary d ON dw.diaryId = d.diaryId
    JOIN Workout w ON w.workoutId = dw.workoutId
    WHERE d.userId = :userId
    AND d.deleted = false
    AND dw.deleted = false
    AND d.workoutDate BETWEEN :startDate AND CURRENT_DATE
    GROUP BY w.part
""")
    List<Object[]> countByUserIdAndAfterDateGroupedByPart(@Param("userId") Integer userId, @Param("startDate") LocalDate startDate);


}
