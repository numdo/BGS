package com.ssafy.bgs.gym.repository;

import com.ssafy.bgs.gym.entity.GymMachine;
import com.ssafy.bgs.gym.entity.GymMachineKey;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GymMachineRepository extends JpaRepository<GymMachine, GymMachineKey> {
    // 특정 헬스장에 속한 GymMachine 목록
    Page<GymMachine> findById_GymId(Integer gymId, Pageable pageable);
}
