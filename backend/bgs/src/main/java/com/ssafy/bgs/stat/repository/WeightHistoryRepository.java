package com.ssafy.bgs.stat.repository;

import com.ssafy.bgs.stat.entity.WeightHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WeightHistoryRepository extends JpaRepository<WeightHistory, Integer> {
    List<WeightHistory> findByUserId(Integer userId);
}
