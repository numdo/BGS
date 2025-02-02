package com.ssafy.bgs.mygym.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PlaceRequestDto {
    private Integer placeId;
    private Integer itemId;
    private Integer x;
    private Integer y;
    private Boolean deleted;
    private Boolean rotated;
}
