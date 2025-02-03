package com.ssafy.bgs.evaluation.controller;

import com.ssafy.bgs.evaluation.dto.request.EvaluationRequestDto;
import com.ssafy.bgs.evaluation.dto.response.EvaluationResponseDto;
import com.ssafy.bgs.evaluation.service.EvaluationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/evaluations")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

    /**
     * 평가 게시물 전체 조회 (페이징)
     */
    @GetMapping
    public ResponseEntity<Page<EvaluationResponseDto>> getAllEvaluations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Pageable pageable = PageRequest.of(page, size,
                Sort.by(direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy));

        return ResponseEntity.ok(evaluationService.getAllEvaluations(pageable));
    }

    /**
     * 평가 게시물 상세 조회
     */
    @GetMapping("/{evaluationId}")
    public ResponseEntity<EvaluationResponseDto> getEvaluationById(@PathVariable Integer evaluationId) {
        return ResponseEntity.ok(evaluationService.getEvaluationById(evaluationId));
    }

    /**
     * 평가 게시물 등록 (이미지 포함)
     */
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<EvaluationResponseDto> createEvaluation(
            Authentication authentication,
            @RequestPart(value = "data") @Valid EvaluationRequestDto dto,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException {

        Integer userId = Integer.parseInt(authentication.getName());
        return ResponseEntity.ok(evaluationService.createEvaluation(userId, dto, images));
    }

    /**
     * 평가 게시물 수정 (이미지 포함)
     */
    @PatchMapping(value = "/{evaluationId}", consumes = "multipart/form-data")
    public ResponseEntity<EvaluationResponseDto> updateEvaluation(
            @PathVariable Integer evaluationId,
            Authentication authentication,
            @RequestPart("updates") Map<String, Object> updates,
            @RequestParam(value = "existingImageUrls", required = false) List<String> existingImageUrls,
            @RequestPart(value = "newImages", required = false) List<MultipartFile> newImages) throws IOException {

        Integer userId = Integer.parseInt(authentication.getName());
        return ResponseEntity.ok(evaluationService.updateEvaluation(evaluationId, userId, updates, existingImageUrls, newImages));
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
}
