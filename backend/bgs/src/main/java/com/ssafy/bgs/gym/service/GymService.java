package com.ssafy.bgs.gym.service;

import com.ssafy.bgs.gym.dto.request.GymRequestDto;
import com.ssafy.bgs.gym.dto.response.GymResponseDto;
import com.ssafy.bgs.gym.dto.response.MachineResponseDto;
import com.ssafy.bgs.gym.entity.*;
import com.ssafy.bgs.gym.repository.GymMachineRepository;
import com.ssafy.bgs.gym.repository.GymRepository;
import com.ssafy.bgs.gym.repository.MachineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GymService {

    private final GymRepository gymRepository;
    private final MachineRepository machineRepository;
    private final GymMachineRepository gymMachineRepository;

    /**
     * 1) 헬스장 목록 조회
     * 영업중인 헬스장만 가져옴(deleted=false)
     */
    public List<GymResponseDto> getAllGyms() {
        return gymRepository.findAll().stream()
                .map(this::toGymResponse)
                .collect(Collectors.toList());
    }

    /**
     * 2) 헬스장 등록
     */
    public GymResponseDto createGym(GymRequestDto request) {
        Gym gym = Gym.builder()
                .gymName(request.getGymName())
                .gymAddress(request.getGymAddress())
                .build();

        Gym saved = gymRepository.save(gym);
        return toGymResponse(saved);
    }

    /**
     * 3) 머신 목록 조회
     */
    public List<MachineResponseDto> getAllMachines() {
        return machineRepository.findAll().stream()
                .map(this::toMachineResponse)
                .collect(Collectors.toList());
    }

    /**
     * 4) 특정 헬스장에 등록된 머신 목록 조회
     */
    public List<MachineResponseDto> getMachinesByGymId(Integer gymId) {
        List<GymMachine> gymMachines = gymMachineRepository.findById_GymId(gymId);

        return gymMachines.stream()
                .map(GymMachine::getMachine)
                .map(this::toMachineResponse)
                .collect(Collectors.toList());
    }

    /**
     * 5) 헬스장에 (이미 존재하는) 머신 등록
     */
    @Transactional
    public void addMachineToGym(Integer gymId, Integer machineId) {
        // 1) 헬스장 존재 확인
        Gym gym = gymRepository.findById(gymId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 헬스장 ID=" + gymId));

        // 2) 머신 존재 확인
        Machine machine = machineRepository.findById(machineId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 머신 ID=" + machineId));

        // 3) 복합 PK가 이미 존재하는지(중복 등록) 확인
        GymMachineKey key = new GymMachineKey(gymId, machineId);
        if (gymMachineRepository.existsById(key)) {
            throw new IllegalArgumentException("이미 등록된 (gymId, machineId) 입니다.");
        }

        // 4) GymMachine 생성
        GymMachine gm = GymMachine.builder()
                .id(key)
                .gym(gym)
                .machine(machine)
                .build();
        gymMachineRepository.save(gm);
    }

    // =========================
    // 변환 메서드(엔티티 → DTO)
    // =========================
    private GymResponseDto toGymResponse(Gym gym) {
        if (gym == null) return null;
        return GymResponseDto.builder()
                .gymId(gym.getGymId())
                .gymName(gym.getGymName())
                .gymAddress(gym.getGymAddress())
                .createdAt(gym.getCreatedAt())
                .deleted(gym.getDeleted())
                .build();
    }

    private MachineResponseDto toMachineResponse(Machine machine) {
        if (machine == null) return null;
        return MachineResponseDto.builder()
                .machineId(machine.getMachineId())
                .machineName(machine.getMachineName())
                .createdAt(machine.getCreatedAt())
                .build();
    }
}
