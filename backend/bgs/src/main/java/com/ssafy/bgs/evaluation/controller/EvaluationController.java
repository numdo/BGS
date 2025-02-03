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

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/evaluations")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

    /**
     * 평가 게시물 전체 조회
     */
    @GetMapping
    public ResponseEntity<Page<EvaluationResponseDto>> getAllEvaluations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        // Pageable 객체 생성
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy)
        );

        Page<EvaluationResponseDto> evaluations = evaluationService.getAllEvaluations(pageable);
        return ResponseEntity.ok(evaluations);
    }


    /**
     * 평가 게시물 상세 조회
     */
    @GetMapping("/{evaluationId}")
    public ResponseEntity<EvaluationResponseDto> getEvaluationById(
            @PathVariable Integer evaluationId) {
        EvaluationResponseDto evaluation = evaluationService.getEvaluationById(evaluationId);
        return ResponseEntity.ok(evaluation);
    }

    /**
     * 평가 게시물 등록
     */
    @PostMapping
    public ResponseEntity<EvaluationResponseDto> createEvaluation(
            @Valid @RequestBody EvaluationRequestDto dto,
            Authentication authentication) {

        // JWT 토큰 인증 정보에서 userId 추출
        Integer userId = Integer.valueOf(authentication.getName());

        // userId를 DTO에 전달하지 않고, 별도로 서비스에 넘김
        EvaluationResponseDto evaluation = evaluationService.createEvaluation(userId, dto);
        return ResponseEntity.ok(evaluation);
    }


    /**
     * 평가 게시물 수정
     */
    @PatchMapping("/{evaluationId}")
    public ResponseEntity<EvaluationResponseDto> updateEvaluation(
            @PathVariable Integer evaluationId,
            @RequestBody Map<String, Object> updates,
            Authentication authentication) {

        // JWT 토큰에서 로그인된 사용자 ID 가져오기
        Integer loggedInUserId = Integer.valueOf(authentication.getName());

        // Service 호출
        EvaluationResponseDto evaluation =
                evaluationService.updateEvaluation(evaluationId, loggedInUserId, updates);

        return ResponseEntity.ok(evaluation);
    }



    /**
     * 평가 게시물 삭제
     */
    @DeleteMapping("/{evaluationId}")
    public ResponseEntity<Void> deleteEvaluation(
            @PathVariable Integer evaluationId,
            Authentication authentication) {

        // JWT 인증에서 userId 추출
        Integer loggedInUserId = Integer.valueOf(authentication.getName());

        // Service 호출
        evaluationService.deleteEvaluation(evaluationId, loggedInUserId);
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

        // JWT 토큰에서 사용자 ID 추출
        Integer userId = Integer.parseInt(authentication.getName());
        Boolean approval = request.get("approval");

        evaluationService.vote(evaluationId, userId, approval);
        return ResponseEntity.ok("투표가 완료되었습니다.");
    }

}
