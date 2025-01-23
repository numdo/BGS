package com.ssafy.bgs.gym.repository;

import com.ssafy.bgs.gym.entity.Machine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MachineRepository extends JpaRepository<Machine, Integer> {
}
