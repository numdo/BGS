package com.ssafy.bgs.mygym.repository;

import com.ssafy.bgs.mygym.entity.UserItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserItemRepository extends JpaRepository<UserItem, Integer> {
}
