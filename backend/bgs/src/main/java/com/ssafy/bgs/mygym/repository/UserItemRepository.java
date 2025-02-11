package com.ssafy.bgs.mygym.repository;

import com.ssafy.bgs.mygym.entity.UserItem;
import com.ssafy.bgs.mygym.entity.UserItemId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserItemRepository extends JpaRepository<UserItem, Integer> {
    boolean existsById(UserItemId id);
}
