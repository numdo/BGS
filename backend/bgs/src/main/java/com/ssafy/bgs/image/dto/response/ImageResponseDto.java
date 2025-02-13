package com.ssafy.bgs.image.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ImageResponseDto {
    private Long imageId;
    private String url;
    private String thumbnailUrl;
    private String extension;
}
