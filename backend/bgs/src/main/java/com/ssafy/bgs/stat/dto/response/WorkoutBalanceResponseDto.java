package com.ssafy.bgs.stat.dto.response;

import com.ssafy.bgs.stat.entity.WorkoutPart;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkoutBalanceResponseDto {
    private Integer chest;
    private Integer lat;
    private Integer triceps;
    private Integer shoulder;
    private Integer cardio;
    private Integer biceps;
    private Integer core;
    private Integer leg;

    public void setPartCount(WorkoutPart part, Integer count) {
        switch (part) {
            case CHEST -> setChest(count);
            case LAT -> setLat(count);
            case TRICEPS -> setTriceps(count);
            case SHOULDER -> setShoulder(count);
            case CARDIO -> setCardio(count);
            case BICEPS -> setBiceps(count);
            case CORE -> setCore(count);
            case LEG -> setLeg(count);
        }
    }

}
