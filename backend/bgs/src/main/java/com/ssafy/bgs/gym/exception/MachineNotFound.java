package com.ssafy.bgs.gym.exception;

import com.ssafy.bgs.common.NotFoundException;

public class MachineNotFound extends NotFoundException {
    public MachineNotFound(Integer machineId) {
        super("없는 운동머신: " + machineId);
    }
}
