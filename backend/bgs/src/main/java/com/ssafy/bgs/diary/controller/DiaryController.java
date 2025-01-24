package com.ssafy.bgs.diary.controller;

import com.ssafy.bgs.diary.dto.request.CommentRequestDto;
import com.ssafy.bgs.diary.dto.request.DiaryRequestDto;
import com.ssafy.bgs.diary.dto.response.CommentResponseDto;
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
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize
    ) {
        Page<Diary> diaryList = diaryService.getDiaryList(userId, workoutDate, page, pageSize);

        return new ResponseEntity<>(diaryList, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<DiaryResponseDto> addDiary(@RequestBody DiaryRequestDto diaryRequestDto) {
        diaryService.addDiary(diaryRequestDto);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @GetMapping("/{diaryId}")
    public ResponseEntity<DiaryResponseDto> getDiary(@PathVariable Integer diaryId) {
        DiaryResponseDto diaryResponseDto = diaryService.getDiary(diaryId);
        return new ResponseEntity<>(diaryResponseDto, HttpStatus.OK);
    }

    @PatchMapping("/{diaryId}")
    public ResponseEntity<DiaryResponseDto> updateDiary(@PathVariable Integer diaryId, @RequestBody DiaryRequestDto diaryRequestDto) {
        diaryService.updateDiary(diaryRequestDto);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/{diaryId}")
    public ResponseEntity<Boolean> deleteDiary(@PathVariable Integer diaryId) {
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

    @GetMapping("/{diaryId}/comments")
    public ResponseEntity<Page<CommentResponseDto>> getCommentList(
            @PathVariable Integer diaryId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize
    ) {
        Page<CommentResponseDto> commentList = diaryService.getCommentList(diaryId , page, pageSize);

        return new ResponseEntity<>(commentList, HttpStatus.OK);
    }

    @PostMapping("/{diaryId}/comments")
    public ResponseEntity<CommentResponseDto> addComment(@PathVariable Integer diaryId, @RequestBody CommentRequestDto commentRequestDto) {
        diaryService.addComment(commentRequestDto);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PatchMapping("/{diaryId}/comments/{commentId}")
    public ResponseEntity<CommentResponseDto> updateComment(
            @PathVariable Integer diaryId,
            @PathVariable Integer commentId,
            @RequestBody CommentRequestDto commentRequestDto
    ) {
        diaryService.updateComment(commentRequestDto);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/{diaryId}/comments/{commentId}")
    public ResponseEntity<Boolean> deleteComment(@PathVariable Integer diaryId, @PathVariable Integer commentId) {
        diaryService.deleteComment(commentId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
