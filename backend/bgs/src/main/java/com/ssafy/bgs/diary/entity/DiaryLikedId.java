package com.ssafy.bgs.diary.entity;

import java.io.Serializable;
import java.util.Objects;

public class DiaryLikedId implements Serializable {
    private Integer diaryId;
    private Integer userId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DiaryLikedId that = (DiaryLikedId) o;
        return Objects.equals(diaryId, that.diaryId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(diaryId, userId);
    }
}
