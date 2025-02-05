package com.ssafy.bgs.diary.controller;

import com.ssafy.bgs.diary.dto.request.CommentRequestDto;
import com.ssafy.bgs.diary.dto.request.DiaryRequestDto;
import com.ssafy.bgs.diary.dto.response.CommentResponseDto;
import com.ssafy.bgs.diary.dto.response.DiaryResponseDto;
import com.ssafy.bgs.diary.dto.response.FeedResponseDto;
import com.ssafy.bgs.diary.entity.Diary;
import com.ssafy.bgs.diary.service.DiaryService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/diaries")
public class DiaryController {

    private final DiaryService diaryService;

    public DiaryController(DiaryService diaryService) {
        this.diaryService = diaryService;
    }

    @GetMapping("/feeds")
    public ResponseEntity<?> getFeedList(
            @AuthenticationPrincipal Integer readerId,
            @RequestParam(required = false) Integer userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "9") int pageSize
    ) {
        List<FeedResponseDto> feedList = diaryService.getFeedList(readerId, userId, page, pageSize);
        return new ResponseEntity<>(feedList, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<?> getDiaryList(
            @RequestParam Integer userId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month
    ) {
        LocalDate today = LocalDate.now();
        int defaultYear = (year != null) ? year : today.getYear();
        int defaultMonth = (month != null) ? month : today.getMonthValue();

        List<Diary> diaryList = diaryService.getDiaryList(userId, defaultYear, defaultMonth);
        return new ResponseEntity<>(diaryList, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<DiaryResponseDto> addDiary(
            @AuthenticationPrincipal Integer userId,
            @RequestPart(name = "diary") DiaryRequestDto diaryRequestDto,
            @RequestPart(name = "files", required = false) List<MultipartFile> files
    ) {
        diaryRequestDto.setUserId(userId);
        diaryService.addDiary(diaryRequestDto, files);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @GetMapping("/{diaryId}")
    public ResponseEntity<DiaryResponseDto> getDiary(@PathVariable Integer diaryId) {
        DiaryResponseDto diaryResponseDto = diaryService.getDiary(diaryId);
        return new ResponseEntity<>(diaryResponseDto, HttpStatus.OK);
    }

    @PatchMapping("/{diaryId}")
    public ResponseEntity<DiaryResponseDto> updateDiary(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer diaryId,
            @RequestPart(name = "diary") DiaryRequestDto diaryRequestDto,
            @RequestPart(name = "urls",required = false) List<String> urls,
            @RequestPart(name = "files",required = false) List<MultipartFile> files
    ) {
        diaryRequestDto.setDiaryId(diaryId);
        diaryService.updateDiary(userId, diaryRequestDto, urls, files);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/{diaryId}")
    public ResponseEntity<Boolean> deleteDiary(@AuthenticationPrincipal Integer userId, @PathVariable Integer diaryId) {
        diaryService.deleteDiary(userId, diaryId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/{diaryId}/liked")
    public ResponseEntity<Boolean> likeDiary(@AuthenticationPrincipal Integer userId, @PathVariable Integer diaryId) {
        diaryService.likeDiary(userId, diaryId);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @DeleteMapping("/{diaryId}/liked")
    public ResponseEntity<Boolean> unlikeDiary(@AuthenticationPrincipal Integer userId, @PathVariable Integer diaryId) {
        diaryService.unlikeDiary(userId, diaryId);
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
    public ResponseEntity<CommentResponseDto> addComment(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer diaryId,
            @RequestBody CommentRequestDto commentRequestDto
    ) {
        commentRequestDto.setUserId(userId);
        commentRequestDto.setDiaryId(diaryId);
        diaryService.addComment(commentRequestDto);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PatchMapping("/{diaryId}/comments/{commentId}")
    public ResponseEntity<CommentResponseDto> updateComment(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer diaryId,
            @PathVariable Integer commentId,
            @RequestBody CommentRequestDto commentRequestDto
    ) {
        commentRequestDto.setUserId(userId);
        commentRequestDto.setDiaryId(diaryId);
        commentRequestDto.setCommentId(commentId);
        diaryService.updateComment(commentRequestDto);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/{diaryId}/comments/{commentId}")
    public ResponseEntity<Boolean> deleteComment(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer diaryId,
            @PathVariable Integer commentId) {
        diaryService.deleteComment(userId, commentId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
