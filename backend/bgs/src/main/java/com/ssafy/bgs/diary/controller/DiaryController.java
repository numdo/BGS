package com.ssafy.bgs.diary.controller;

import com.ssafy.bgs.diary.dto.request.DiaryRequestDto;
import com.ssafy.bgs.diary.dto.response.DiaryResponseDto;
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
    public ResponseEntity<Diary> addDiary(@RequestBody DiaryRequestDto diaryRequestDto) {
        diaryService.addDiary(diaryRequestDto);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @GetMapping("/{diaryId}")
    public ResponseEntity<DiaryResponseDto> getDiary(@PathVariable Integer diaryId) {
        DiaryResponseDto diaryResponseDto = diaryService.getDiary(diaryId);
        return new ResponseEntity<>(diaryResponseDto, HttpStatus.OK);
    }

    @PatchMapping("/{diaryId}")
    public ResponseEntity<Diary> updateDiary(@PathVariable Integer diaryId, @RequestBody DiaryRequestDto diaryRequestDto) {
        diaryService.updateDiary(diaryRequestDto);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/{diaryId}")
    public ResponseEntity<Diary> deleteDiary(@PathVariable Integer diaryId) {
        diaryService.deleteDiary(diaryId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/{diaryId}/liked")
    public ResponseEntity<Boolean> likeDiary(@PathVariable Integer diaryId, @RequestBody Integer userId) {
        diaryService.likeDiary(diaryId, userId);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @DeleteMapping("/{diaryId}/liked")
    public ResponseEntity<Boolean> unlikeDiary(@PathVariable Integer diaryId, @RequestBody Integer userId) {
        diaryService.unlikeDiary(diaryId, userId);
        return new ResponseEntity<>(HttpStatus.OK);
    }


}
