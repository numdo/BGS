package com.ssafy.bgs.gym.controller;

import com.ssafy.bgs.gym.dto.response.MachineResponseDto;
import com.ssafy.bgs.gym.service.GymService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/machines")
@RequiredArgsConstructor
public class MachineController {

    private final GymService gymService;

    /**
     * [GET] 머신 목록 조회
     * GET /api/machines
     */
    @GetMapping
    public List<MachineResponseDto> getAllMachines() {
        return gymService.getAllMachines();
    }

}
