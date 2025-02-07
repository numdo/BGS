package com.ssafy.bgs.diary.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.sql.Date;
import java.util.List;

/**
 * 하나의 이전 기록(하나의 diary)에 여러 운동이 묶일 수 있으므로,
 * workoutIds 리스트 + workoutNames 문자열로 묶어서 반환
 */
@Getter
@Setter
public class PreviousWorkoutResponseDto {
    // (필요하다면 diaryId도 노출해서 해당 일지가 어떤 일지인지 구분할 수 있게)
    private Integer diaryId;

    // 운동 날짜(일지 날짜)
    private Date workoutDate;

    // 여러 운동 ID를 한 번에 담을 리스트
    private List<Integer> workoutIds;

    // 여러 운동명을 합친 문자열 (ex: "벤치프레스, 디클라인 벤치 프레스")
    private String workoutNames;

    // (원하면 운동 부위나 기구도 여러 개 묶을 수 있지만,
    //  보통 가장 중요한 건 ID와 이름이므로 일단 생략 가능)
}
