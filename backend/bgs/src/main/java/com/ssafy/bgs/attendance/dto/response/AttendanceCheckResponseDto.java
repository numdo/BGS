package com.ssafy.bgs.attendance.dto.response;


import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class AttendanceCheckResponseDto {
    private Integer attendanceId;
    private LocalDate attendanceDate;
    private String gymName;
}
