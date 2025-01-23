package com.ssafy.bgs.diary.service;

import com.ssafy.bgs.diary.dto.request.DiaryCreateDto;
import com.ssafy.bgs.diary.entity.Diary;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.sql.Date;

@Service
public interface DiaryService {
    Page<Diary> getDiaryList(Integer userId, Date workoutDate, int page, int pageSize);
    void addDiary(DiaryCreateDto diaryCreateDto);
    void updateDiary(DiaryCreateDto diaryCreateDto);
}
