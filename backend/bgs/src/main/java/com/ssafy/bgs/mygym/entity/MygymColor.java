package com.ssafy.bgs.mygym.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "mygym_colors", schema = "bgs")
@Getter
@Setter
public class MygymColor {
    @Id
    private Integer userId;

    @Column
    private String backgroundColor = "#FFFFFF";
    @Column
    private String wallColor = "#000000";
}
