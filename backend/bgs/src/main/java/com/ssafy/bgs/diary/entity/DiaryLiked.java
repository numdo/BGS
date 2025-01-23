package com.ssafy.bgs.diary.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "diary_liked", schema = "bgs")
@IdClass(DiaryLikedId.class)
@Getter
@Setter
public class DiaryLiked {
    @Id
    private Integer diaryId;
    @Id
    private Integer userId;
}
