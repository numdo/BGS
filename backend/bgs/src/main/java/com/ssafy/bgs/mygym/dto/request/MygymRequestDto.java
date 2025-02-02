package com.ssafy.bgs.mygym.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class MygymRequestDto {
    private Integer userId;
    private String backgroundColor;
    private String wallColor;
    private List<PlaceRequestDto> places = new ArrayList<>();
}
