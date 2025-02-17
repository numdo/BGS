package com.ssafy.bgs.evaluation.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.bgs.diary.dto.request.CommentRequestDto;
import com.ssafy.bgs.diary.dto.response.CommentResponseDto;
import com.ssafy.bgs.evaluation.dto.request.EvaluationRequestDto;
import com.ssafy.bgs.evaluation.dto.response.EvaluationFeedResponseDto;
import com.ssafy.bgs.evaluation.dto.response.EvaluationResponseDto;
import com.ssafy.bgs.evaluation.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/evaluations")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

    @GetMapping("/feeds")
    public ResponseEntity<?> getFeedList(
            @RequestParam(required = false) Boolean closed,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "9") int pageSize
    ) {
        List<EvaluationFeedResponseDto> feedList = evaluationService.getFeedList(closed, page, pageSize);
        return new ResponseEntity<>(feedList, HttpStatus.OK);
    }

    /**
     * 평가 게시물 전체 조회 (페이징)
     */
    @GetMapping
    public ResponseEntity<Page<EvaluationResponseDto>> getAllEvaluations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) Boolean closed) {

        Pageable pageable = PageRequest.of(page, size,
                Sort.by(direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy));

        return ResponseEntity.ok(evaluationService.getAllEvaluations(pageable, closed));
    }

    /**
     * 평가 게시물 상세 조회
     */
    @GetMapping("/{evaluationId}")
    public ResponseEntity<EvaluationResponseDto> getEvaluationById(
            @AuthenticationPrincipal Integer userId, @PathVariable Integer evaluationId) {
        return ResponseEntity.ok(evaluationService.getEvaluationById(evaluationId, userId));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<EvaluationResponseDto> createEvaluation(
            Authentication authentication,
            @RequestPart("data") String jsonData,
            @RequestPart(value = "videos", required = false) List<MultipartFile> videos) throws IOException {

        Integer userId = Integer.parseInt(authentication.getName());

        ObjectMapper objectMapper = new ObjectMapper();
        EvaluationRequestDto dto = objectMapper.readValue(jsonData, EvaluationRequestDto.class);

        // HEVC 변환 로직 적용
        List<File> processedVideos = processVideos(videos);

        return ResponseEntity.ok(evaluationService.createEvaluation(userId, dto, processedVideos));
    }

    @PatchMapping(value = "/{evaluationId}", consumes = "multipart/form-data")
    public ResponseEntity<EvaluationResponseDto> updateEvaluation(
            @PathVariable Integer evaluationId,
            Authentication authentication,
            @RequestPart(name = "updates", required = false) String updatesJson,
            @RequestParam(value = "existingVideoUrls", required = false) List<String> existingVideoUrls,
            @RequestPart(value = "newVideos", required = false) List<MultipartFile> newVideos) throws IOException {

        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Integer userId = Integer.parseInt(authentication.getName());
        ObjectMapper objectMapper = new ObjectMapper();
        Map<String, Object> updates = objectMapper.readValue(updatesJson, Map.class);

        // HEVC 변환 로직 적용
        List<File> processedVideos = processVideos(newVideos);

        return ResponseEntity.ok(evaluationService.updateEvaluation(evaluationId, userId, updates, existingVideoUrls, processedVideos));
    }


    /**
     * 평가 게시물 삭제 (Soft Delete)
     */
    @DeleteMapping("/{evaluationId}")
    public ResponseEntity<Void> deleteEvaluation(
            @PathVariable Integer evaluationId,
            Authentication authentication) {

        Integer userId = Integer.parseInt(authentication.getName());
        evaluationService.deleteEvaluation(evaluationId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 투표하기
     */
    @PostMapping("/{evaluationId}/votes")
    public ResponseEntity<String> vote(
            @PathVariable Integer evaluationId,
            @RequestBody Map<String, Boolean> request,
            Authentication authentication) {

        Integer userId = Integer.parseInt(authentication.getName());
        Boolean approval = request.get("approval");

        evaluationService.vote(evaluationId, userId, approval);
        return ResponseEntity.ok("투표가 완료되었습니다.");
    }

    @GetMapping("/{evaluationId}/comments")
    public ResponseEntity<?> getCommentList(
            @PathVariable Integer evaluationId
    ) {
        List<CommentResponseDto> commentList = evaluationService.getCommentList(evaluationId);

        return new ResponseEntity<>(commentList, HttpStatus.OK);
    }

    @PostMapping("/{evaluationId}/comments")
    public ResponseEntity<?> addComment(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer evaluationId,
            @RequestBody CommentRequestDto commentRequestDto
    ) {
        commentRequestDto.setUserId(userId);
        commentRequestDto.setDiaryId(evaluationId);
        evaluationService.addComment(commentRequestDto);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PatchMapping("/{evaluationId}/comments/{commentId}")
    public ResponseEntity<CommentResponseDto> updateComment(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer evaluationId,
            @PathVariable Integer commentId,
            @RequestBody CommentRequestDto commentRequestDto
    ) {
        commentRequestDto.setUserId(userId);
        commentRequestDto.setDiaryId(evaluationId);
        commentRequestDto.setCommentId(commentId);
        evaluationService.updateComment(commentRequestDto);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/{evaluationId}/comments/{commentId}")
    public ResponseEntity<Boolean> deleteComment(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer evaluationId,
            @PathVariable Integer commentId) {
        evaluationService.deleteComment(userId, commentId);
        return new ResponseEntity<>(HttpStatus.OK);
    }



    private List<File> processVideos(List<MultipartFile> videos) throws IOException {
        if (videos == null || videos.isEmpty()) {
            return List.of();
        }

        return videos.stream().map(this::convertVideoIfHEVC).collect(Collectors.toList());
    }

    private File convertVideoIfHEVC(MultipartFile file) {
        try {
            // 원본 파일 저장
            File originalFile = new File("uploads/" + file.getOriginalFilename());
            file.transferTo(originalFile);

            // FFmpeg를 사용해 코덱 확인 (HEVC인지 판별)
            Process checkProcess = new ProcessBuilder(
                    "ffmpeg", "-i", originalFile.getAbsolutePath(), "-hide_banner"
            ).redirectErrorStream(true).start();
            String output = new String(checkProcess.getInputStream().readAllBytes());
            checkProcess.waitFor();

            if (output.contains("Video: hevc")) {
                // H.264로 변환할 파일 경로 설정
                String outputFileName = originalFile.getAbsolutePath().replace(".mov", ".mp4");
                File convertedFile = new File(outputFileName);

                // HEVC → H.264 변환
                Process convertProcess = new ProcessBuilder(
                        "ffmpeg", "-i", originalFile.getAbsolutePath(),
                        "-vcodec", "libx264", "-crf", "23", "-preset", "medium",
                        convertedFile.getAbsolutePath()
                ).start();
                convertProcess.waitFor();

                // 원본 파일 삭제
                Files.delete(originalFile.toPath());

                return convertedFile;
            }

            return originalFile; // HEVC가 아니면 그대로 반환
        } catch (Exception e) {
            throw new RuntimeException("🚨 동영상 처리 실패!", e);
        }
    }
}
