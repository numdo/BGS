package com.ssafy.bgs.mygym.repository;

import com.ssafy.bgs.mygym.entity.CoinHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CoinHistoryRepository extends JpaRepository<CoinHistory, Integer> {
    List<CoinHistory> findByUserId(Integer userId);
}
