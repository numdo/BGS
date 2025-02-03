package com.ssafy.bgs.mygym.repository;

import com.ssafy.bgs.mygym.entity.Place;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlaceRepository extends JpaRepository<Place, Integer> {

    List<Place> findByUserIdAndDeletedFalse(Integer userId);
}
