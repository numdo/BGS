package com.ssafy.bgs.gym.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GymMachineKey implements Serializable {

    @Column(name = "gym_id")
    private Integer gymId;

    @Column(name = "machine_id")
    private Integer machineId;
}
