package com.ssafy.bgs.gym.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "machines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Machine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // TINYINT AUTO_INCREMENT
    @Column(name = "machine_id")
    private Integer machineId;

    @Column(name = "machine_name")
    private String machineName;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
