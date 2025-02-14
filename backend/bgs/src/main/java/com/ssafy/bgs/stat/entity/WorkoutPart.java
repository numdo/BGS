package com.ssafy.bgs.stat.entity;

import java.util.Arrays;

public enum WorkoutPart {
    CHEST("가슴"),
    LAT("등"),
    TRICEPS("삼두"),
    SHOULDER("어깨"),
    CARDIO("유산소"),
    BICEPS("이두"),
    CORE("코어"),
    LEG("하체");

    private final String value;

    WorkoutPart(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static WorkoutPart fromString(String text) {
        return Arrays.stream(values())
                .filter(part -> part.value.equals(text))
                .findFirst()
                .orElse(null);
    }
}