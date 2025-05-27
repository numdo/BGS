package com.ssafy.bgs.mygym.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.sql.Timestamp;

@Data
@AllArgsConstructor
public class CoinHistoryResponseDto {
    private Integer coinHistoryId;
    private Integer userId;
    private Integer amount;
    private String usageType;
    private Timestamp createdAt;
}
