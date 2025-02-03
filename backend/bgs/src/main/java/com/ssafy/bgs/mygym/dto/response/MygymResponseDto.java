package com.ssafy.bgs.mygym.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
public class MygymResponseDto {
    private Integer userId;
    private String nickname;
    private String backgroundColor;
    private String wallColor;
    private List<PlaceResponseDto> places = new ArrayList<>();
}
