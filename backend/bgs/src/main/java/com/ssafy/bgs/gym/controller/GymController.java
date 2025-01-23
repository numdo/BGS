package com.ssafy.bgs.gym.controller;

import com.ssafy.bgs.gym.dto.request.GymRequestDto;
import com.ssafy.bgs.gym.dto.response.GymResponseDto;
import com.ssafy.bgs.gym.dto.response.MachineResponseDto;
import com.ssafy.bgs.gym.service.GymService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gyms")
@RequiredArgsConstructor
public class GymController {

    private final GymService gymService;

    /**
     * [GET] 헬스장 목록 조회
     * GET /api/gyms
     */
    @GetMapping
    public Page<GymResponseDto> getAllGyms(Pageable pageable) {
        return gymService.getAllGyms(pageable);
    }

    /**
     * [POST] 헬스장 등록
     * POST /api/gyms
     */
    @PostMapping
    public GymResponseDto createGym(@RequestBody GymRequestDto gymRequest) {
        return gymService.createGym(gymRequest);
    }

    /**
     * [GET] 특정 헬스장에 등록된 머신 목록 조회
     * GET /api/gyms/{gymId}/machines
     */
    @GetMapping("/{gymId}/machines")
    public Page<MachineResponseDto> getMachinesByGym(@PathVariable Integer gymId, Pageable pageable) {
        return gymService.getMachinesByGymId(gymId, pageable);
    }

    /**
     * [POST] 특정 헬스장에 (이미 존재하는) 머신 등록
     * POST /api/gyms/{gymId}/machines/{machineId}
     */
    @PostMapping("/{gymId}/machines/{machineId}")
    public void addMachineToGym(@PathVariable Integer gymId, @PathVariable Integer machineId) {
        gymService.addMachineToGym(gymId, machineId);
    }
}
