package com.ssafy.bgs.user.dto.response;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class InfoResponseDto {
    private Integer userId;
    private String nickname;
    private String introduction;
    private String role;
    private String profileImageUrl;
}
