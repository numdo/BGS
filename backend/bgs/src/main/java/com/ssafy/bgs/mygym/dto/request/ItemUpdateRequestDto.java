package com.ssafy.bgs.mygym.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemUpdateRequestDto {
    private Integer itemId;
    private String itemName;
    private Integer width;
    private Integer height;
    private String imageUrl;
    private Integer price;
    private Boolean usable;
}
