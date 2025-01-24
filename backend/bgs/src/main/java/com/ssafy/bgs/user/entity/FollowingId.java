package com.ssafy.bgs.user.entity;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.*;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class FollowingId implements Serializable {

    private Integer followerId;
    private Integer followeeId;
}