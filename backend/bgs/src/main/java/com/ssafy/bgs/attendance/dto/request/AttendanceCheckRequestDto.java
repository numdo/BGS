package com.ssafy.bgs.attendance.dto.request;

import lombok.Data;

@Data
public class AttendanceCheckRequestDto {
    private Double latitude;    // 회원의 현재 위도
    private Double longitude;   // 회원의 현재 경도
}
