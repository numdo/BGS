package com.ssafy.bgs.mygym.dto.response;

import com.ssafy.bgs.image.dto.response.ImageResponseDto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PlaceResponseDto {
    private Integer placeId;
    private Integer itemId;
    private Integer x;
    private Integer y;
    private Boolean rotated;
    private Boolean deleted;
    private ImageResponseDto image;
}
