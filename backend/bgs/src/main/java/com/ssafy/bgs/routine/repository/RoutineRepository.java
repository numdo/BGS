package com.ssafy.bgs.routine.repository;

import com.ssafy.bgs.routine.entity.Routine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RoutineRepository extends JpaRepository<Routine, Integer> {

    // 특정 유저의 Routine을 등록일(createdAt) 기준으로 기간 내 조회 (삭제되지 않은 데이터)
    List<Routine> findByUserIdAndCreatedAtBetweenAndDeletedFalse(
            Integer userId, LocalDateTime startDate, LocalDateTime endDate);

    // 특정 유저의 Routine 전체 조회 (삭제되지 않은 데이터)
    List<Routine> findByUserIdAndDeletedFalse(Integer userId);
}
