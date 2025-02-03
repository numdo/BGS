package com.ssafy.bgs.evaluation.service;

import com.ssafy.bgs.common.UnauthorizedAccessException;
import com.ssafy.bgs.evaluation.dto.request.EvaluationRequestDto;
import com.ssafy.bgs.evaluation.dto.response.EvaluationResponseDto;
import com.ssafy.bgs.evaluation.entity.Evaluation;
import com.ssafy.bgs.evaluation.entity.Vote;
import com.ssafy.bgs.evaluation.entity.VoteId;
import com.ssafy.bgs.evaluation.entity.WorkoutRecord;
import com.ssafy.bgs.evaluation.exception.EvaluationNotFoundException;
import com.ssafy.bgs.evaluation.exception.VoteNotFoundException;
import com.ssafy.bgs.evaluation.repository.EvaluationRepository;
import com.ssafy.bgs.evaluation.repository.VoteRepository;
import com.ssafy.bgs.evaluation.repository.WorkoutRecordRepository;
import com.ssafy.bgs.image.entity.Image;
import com.ssafy.bgs.image.service.ImageService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final VoteRepository voteRepository;
    private final WorkoutRecordRepository workoutRecordRepository;
    private final ImageService imageService;

    /**
     * 평가 게시물 전체 조회 (페이징 지원)
     */
    @Transactional
    public Page<EvaluationResponseDto> getAllEvaluations(Pageable pageable, Boolean closed) {
        Page<Evaluation> evaluations;

        if (closed == null) {
            evaluations = evaluationRepository.findByDeletedFalse(pageable); // 삭제되지 않은 모든 게시물
        } else {
            evaluations = evaluationRepository.findByDeletedFalseAndClosed(pageable, closed); // 삭제되지 않고 투표 완료 여부 필터링
        }

        return evaluations.map(this::convertToDto);
    }


    /**
     * 평가 게시물 상세 조회
     */
    @Transactional
    public EvaluationResponseDto getEvaluationById(Integer evaluationId) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new EvaluationNotFoundException(evaluationId));

        // 🔴 삭제된 게시물은 조회 불가
        if (Boolean.TRUE.equals(evaluation.getDeleted())) {
            throw new EvaluationNotFoundException(evaluationId);
        }

        List<String> imageUrls = imageService.getImages("evaluation", evaluationId)
                .stream()
                .map(Image::getUrl)
                .collect(Collectors.toList());

        EvaluationResponseDto responseDto = convertToDto(evaluation);
        responseDto.setImageUrls(imageUrls);
        return responseDto;
    }


    /**
     * 평가 게시물 등록 (이미지 포함)
     */
    @Transactional
    public EvaluationResponseDto createEvaluation(Integer userId, EvaluationRequestDto dto, List<MultipartFile> images) {
        Evaluation evaluation = Evaluation.builder()
                .userId(userId)
                .content(dto.getContent())
                .weight(dto.getWeight())
                .workoutType(dto.getWorkoutType().toUpperCase())
                .opened(false)
                .closed(false)
                .deleted(false)
                .createdAt(new Timestamp(System.currentTimeMillis()))
                .modifiedAt(new Timestamp(System.currentTimeMillis()))
                .build();

        Evaluation savedEvaluation = evaluationRepository.save(evaluation);

        if (images != null && !images.isEmpty()) {
            imageService.uploadImages(images, "evaluation", Long.valueOf(savedEvaluation.getEvaluationId()));
        }

        return convertToDto(savedEvaluation);
    }

    /**
     * 평가 게시물 수정 (이미지 포함)
     */
    @Transactional
    public EvaluationResponseDto updateEvaluation(Integer evaluationId, Integer userId, Map<String, Object> updates, List<String> existingImageUrls, List<MultipartFile> newImages) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new EvaluationNotFoundException(evaluationId));

        if (!evaluation.getUserId().equals(userId)) {
            throw new UnauthorizedAccessException("본인 게시물이 아니므로 수정할 수 없습니다.");
        }

        if (Boolean.TRUE.equals(evaluation.getOpened())) {
            throw new UnauthorizedAccessException("투표가 시작된 게시물은 수정할 수 없습니다.");
        }

        if (Boolean.TRUE.equals(evaluation.getDeleted())) {
            throw new UnauthorizedAccessException("삭제된 게시물은 수정할 수 없습니다.");
        }

        for (Map.Entry<String, Object> entry : updates.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();

            if ("content".equals(key)) {
                evaluation.setContent((String) value);
            } else if ("weight".equals(key)) {
                evaluation.setWeight(Double.valueOf(value.toString()));
            } else if ("workoutType".equals(key)) {
                evaluation.setWorkoutType(((String) value).toUpperCase());
            }
        }

        evaluation.setModifiedAt(new Timestamp(System.currentTimeMillis()));

        if (newImages != null && !newImages.isEmpty()) {
            imageService.uploadImages(newImages, "evaluation", Long.valueOf(evaluationId));
        }

        return convertToDto(evaluation);
    }


    /**
     * 평가 게시물 삭제(Soft Delete)
     * - 본인이 작성한 게시물만 삭제 가능
     * - 투표가 시작되지 않은 게시물만 삭제 가능
     */
    @Transactional
    public void deleteEvaluation(Integer evaluationId, Integer loggedInUserId) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new EvaluationNotFoundException(evaluationId));

        // 1. 본인 게시물이 맞는지 확인
        if (!evaluation.getUserId().equals(loggedInUserId)) {
            throw new UnauthorizedAccessException("본인 게시물이 아니므로 삭제할 수 없습니다.");
        }

        // 2. 투표가 시작된 게시물은 삭제 불가
        if (Boolean.TRUE.equals(evaluation.getOpened())) {
            throw new UnauthorizedAccessException("투표가 시작된 게시물은 삭제할 수 없습니다.");
        }

        // 3. Soft Delete 처리: deleted = true 로 변경
        evaluation.setDeleted(true);
        evaluationRepository.save(evaluation);
    }


    /**
     * 투표하기
     */
    @Transactional
    public void vote(Integer evaluationId, Integer userId, Boolean approval) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new EvaluationNotFoundException(evaluationId));

        // 🔴 삭제된 게시물은 투표 불가
        if (Boolean.TRUE.equals(evaluation.getDeleted())) {
            throw new UnauthorizedAccessException("삭제된 게시물에는 투표할 수 없습니다.");
        }

        // 🔴 투표가 종료된 게시물은 투표 불가
        if (Boolean.TRUE.equals(evaluation.getClosed())) {
            throw new UnauthorizedAccessException("투표가 종료된 게시물에는 투표할 수 없습니다.");
        }

        VoteId voteId = new VoteId(evaluationId, userId);
        Vote existingVote = voteRepository.findById(voteId).orElse(null);

        // 투표 취소
        if (approval == null) {
            if (existingVote != null) {
                voteRepository.delete(existingVote);
            } else {
                throw new VoteNotFoundException();
            }
        }
        // 새 투표 or 기존 투표 변경
        else {
            if (existingVote == null) {
                // 최초 투표인 경우 -> opened = true 설정
                if (!evaluation.getOpened()) {
                    evaluation.setOpened(true);
                    evaluationRepository.save(evaluation);
                }

                // 새로운 투표 생성
                Vote newVote = Vote.builder()
                        .evaluationId(evaluationId)
                        .userId(userId)
                        .approval(approval)
                        .build();
                voteRepository.save(newVote);

            } else {
                // 기존 투표 상태 변경
                existingVote.setApproval(approval);
                voteRepository.save(existingVote);
            }
        }

        // 🔹 투표를 즉시 반영 (flush)하여 데이터 동기화
        voteRepository.flush();

        // 🔹 투표 종료 조건 확인
        closeEvaluation(evaluationId);
    }



    /**
     * 평가 게시물 투표 종료
     */
    @Transactional
    public void closeEvaluation(Integer evaluationId) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new EvaluationNotFoundException(evaluationId));

        // 🔹 최신 데이터를 가져오도록 강제 동기화
        evaluationRepository.flush();
        voteRepository.flush();

        // 🔹 투표 개수 다시 불러오기
        long totalVotes = voteRepository.countByEvaluationId(evaluationId);
        long approvalCount = voteRepository.countByEvaluationIdAndApprovalTrue(evaluationId);
        long rejectionCount = totalVotes - approvalCount;

        // 종료 조건 확인 (10표 이상, 찬성 7표 이상, 반대 4표 이상 중 하나라도 만족하면 종료)
        if (totalVotes >= 10 || approvalCount >= 7 || rejectionCount >= 4) {
            evaluation.setClosed(true);
            evaluationRepository.save(evaluation);

            // 🔹 찬성 7표 이상이면 운동 기록 반영
            if (approvalCount >= 7) {
                reflectWorkoutRecord(evaluation);
            }
        }
    }

    /**
     * 운동 기록 반영
     */
    private void reflectWorkoutRecord(Evaluation evaluation) {
        WorkoutRecord record = workoutRecordRepository.findById(evaluation.getUserId())
                .orElseGet(() -> WorkoutRecord.builder()
                        .userId(evaluation.getUserId())
                        .build());

        switch (evaluation.getWorkoutType()) {
            case "SQUAT":
                record.setSquatEvaluation(evaluation.getEvaluationId());
                record.setSquat(evaluation.getWeight());
                break;
            case "BENCH":
                record.setBenchpressEvaluation(evaluation.getEvaluationId());
                record.setBenchpress(evaluation.getWeight());
                break;
            case "DEAD":
                record.setDeadliftEvaluation(evaluation.getEvaluationId());
                record.setDeadlift(evaluation.getWeight());
                break;
            default:
                throw new IllegalArgumentException("잘못된 운동 유형입니다.");
        }

        workoutRecordRepository.save(record);
    }

    /**
     * 엔티티를 DTO로 변환
     */
    private EvaluationResponseDto convertToDto(Evaluation evaluation) {
        return EvaluationResponseDto.builder()
                .evaluationId(evaluation.getEvaluationId())
                .userId(evaluation.getUserId())
                .content(evaluation.getContent())
                .weight(evaluation.getWeight())
                .workoutType(evaluation.getWorkoutType())
                .opened(evaluation.getOpened())
                .closed(evaluation.getClosed())
                .createdAt(evaluation.getCreatedAt())
                .modifiedAt(evaluation.getModifiedAt())
                .deleted(evaluation.getDeleted())
                .build();
    }
}
