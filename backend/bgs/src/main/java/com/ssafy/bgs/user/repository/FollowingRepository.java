package com.ssafy.bgs.user.repository;

import com.ssafy.bgs.user.entity.Following;
import com.ssafy.bgs.user.entity.FollowingId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FollowingRepository extends JpaRepository<Following, FollowingId> {

    @Query("SELECT f FROM Following f WHERE f.id.followerId = :followerId")
    List<Following> findByFollowerId(@Param("followerId") Integer followerId);

    @Query("SELECT f FROM Following f WHERE f.id.followeeId = :followeeId")
    List<Following> findByFolloweeId(@Param("followeeId") Integer followeeId);

}
