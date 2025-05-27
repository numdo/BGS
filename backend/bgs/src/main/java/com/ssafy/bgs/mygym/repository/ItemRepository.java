package com.ssafy.bgs.mygym.repository;

import com.ssafy.bgs.mygym.entity.Item;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Integer> {
    Page<Item> findByItemNameContaining(String keyword, Pageable pageable);
    List<Item> findByUsableTrue();
}
