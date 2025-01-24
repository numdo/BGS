package com.ssafy.bgs.diary.entity;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "diary_liked", schema = "bgs")
public class DiaryLiked {
    @EmbeddedId
    private DiaryLikedId id;  // 복합 키를 사용할 필드

}
