package com.ssafy.bgs.user.repository;

import com.ssafy.bgs.user.entity.Following;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FollowingRepository extends JpaRepository<Following, Integer> {
    Optional<Following> findByFollowerIdAndFolloweeId(Integer followerId, Integer followeeId);

    List<Following> findByFollowerId(Integer followerId);

    List<Following> findByFolloweeId(Integer followeeId);
}
