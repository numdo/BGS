package com.ssafy.bgs.routine.dto.response;

import lombok.*;
import org.checkerframework.checker.units.qual.N;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoutineResponseDto {
    private Integer routineId;
    private Integer userId;
    private String routineName;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;
    private String writer;              // 작성자 닉네임
    private String profileImageUrl;     // 작성자 프로필 이미지 URL
    private List<RoutineWorkoutResponseDto> routineWorkouts = new ArrayList<>();
    private String routineImageUrl;

}
