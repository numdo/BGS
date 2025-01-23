package com.ssafy.bgs.diary.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "hashtags", schema = "bgs")
@Getter
@Setter
public class Hashtag {
    @Id
    private String tag;

    @Column
    private Integer diaryId;
}
