package com.ssafy.bgs.diary.controller;

import com.ssafy.bgs.diary.dto.request.DiaryCreateDto;
import com.ssafy.bgs.diary.entity.Diary;
import com.ssafy.bgs.diary.service.DiaryService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;

@RestController
@RequestMapping("/api/diaries")
public class DiaryController {

    private final DiaryService diaryService;

    public DiaryController(DiaryService diaryService) {
        this.diaryService = diaryService;
    }

    @GetMapping
    public ResponseEntity<Page<Diary>> getDiaryList(
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) Date workoutDate,
            @RequestParam int page,
            @RequestParam int pageSize) {
        Page<Diary> diaryList = diaryService.getDiaryList(userId, workoutDate, page, pageSize);

        return new ResponseEntity<>(diaryList, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Diary> createDiary(@RequestBody DiaryCreateDto diaryCreateDto) {
        diaryService.addDiary(diaryCreateDto);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }
}
