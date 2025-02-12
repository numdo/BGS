package com.ssafy.bgs.mygym.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ItemResponseDto {
    private Integer itemId;
    private Boolean owned;
    private String itemName;
    private Integer width;
    private Integer height;
    private Integer price;
    private Boolean usable;
    private String imageUrl;
}
