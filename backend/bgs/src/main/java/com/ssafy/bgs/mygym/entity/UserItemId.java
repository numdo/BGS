package com.ssafy.bgs.mygym.entity;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

@Setter
@Getter
public class UserItemId implements Serializable {
    private Integer userId;
    private Integer itemId;

    public UserItemId() {}

    public UserItemId(Integer userId, Integer itemId) {
        this.userId = userId;
        this.itemId = itemId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserItemId that = (UserItemId) o;
        return Objects.equals(userId, that.userId) && Objects.equals(itemId, that.itemId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, itemId);
    }
}
