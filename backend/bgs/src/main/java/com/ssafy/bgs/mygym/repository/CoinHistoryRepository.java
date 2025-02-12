package com.ssafy.bgs.mygym.repository;

import com.ssafy.bgs.mygym.entity.CoinHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CoinHistoryRepository extends JpaRepository<CoinHistory, Integer> {
    List<CoinHistory> findByUserId(Integer userId);

    @Query("SELECT SUM(ch.amount) FROM CoinHistory ch WHERE ch.userId = :userId AND ch.usageType = :usageType")
    Long sumAmountByUserIdAndUsageType(@Param("userId") Integer userId, @Param("usageType") String usageType);
}
