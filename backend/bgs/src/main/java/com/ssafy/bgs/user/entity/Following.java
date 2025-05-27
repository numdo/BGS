package com.ssafy.bgs.user.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "following")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Following {

    @EmbeddedId
    private FollowingId id;

}
