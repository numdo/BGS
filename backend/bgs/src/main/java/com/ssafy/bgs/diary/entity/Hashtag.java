package com.ssafy.bgs.diary.entity;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "hashtags", schema = "bgs")
public class Hashtag {
    @EmbeddedId
    private HashtagId id;
}
