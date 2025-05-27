package com.ssafy.bgs.gym.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "gym_machines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GymMachine {

    @EmbeddedId
    private GymMachineKey id;  // 복합 PK(gym_id, machine_id)

    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @Column(name = "deleted", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean deleted;

    @MapsId("gymId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gym_id")
    private Gym gym;

    @MapsId("machineId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machine_id")
    private Machine machine;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.deleted == null) {
            this.deleted = false;
        }
    }
}
