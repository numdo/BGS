package com.ssafy.bgs.diary.entity;

import jakarta.persistence.Column;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

@Setter
@Getter
public class HashtagId implements Serializable {
    @Column(name = "tag")
    private String tag;
    @Column(name = "diary_id")
    private Integer diaryId;

    public HashtagId() {}

    public HashtagId(Integer diaryId, String tag) {
        this.tag = tag;
        this.diaryId = diaryId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        HashtagId that = (HashtagId) o;
        return Objects.equals(tag, that.tag) && Objects.equals(diaryId, that.diaryId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(tag, diaryId);
    }
}
