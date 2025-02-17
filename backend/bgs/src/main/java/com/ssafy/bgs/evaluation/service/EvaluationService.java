package com.ssafy.bgs.evaluation.service;

import com.ssafy.bgs.common.UnauthorizedAccessException;
import com.ssafy.bgs.diary.dto.request.CommentRequestDto;
import com.ssafy.bgs.diary.dto.response.CommentResponseDto;
import com.ssafy.bgs.diary.exception.CommentNotFoundException;
import com.ssafy.bgs.evaluation.dto.request.EvaluationRequestDto;
import com.ssafy.bgs.evaluation.dto.response.EvaluationFeedResponseDto;
import com.ssafy.bgs.evaluation.dto.response.EvaluationResponseDto;
import com.ssafy.bgs.evaluation.entity.*;
import com.ssafy.bgs.evaluation.exception.EvaluationNotFoundException;
import com.ssafy.bgs.evaluation.exception.VoteNotFoundException;
import com.ssafy.bgs.evaluation.repository.EvaluationCommentRepository;
import com.ssafy.bgs.evaluation.repository.EvaluationRepository;
import com.ssafy.bgs.evaluation.repository.VoteRepository;
import com.ssafy.bgs.evaluation.repository.WorkoutRecordRepository;
import com.ssafy.bgs.image.dto.response.ImageResponseDto;
import com.ssafy.bgs.image.entity.Image;
import com.ssafy.bgs.image.service.ImageService;
import com.ssafy.bgs.mygym.entity.CoinHistory;
import com.ssafy.bgs.user.entity.User;
import com.ssafy.bgs.user.exception.UserNotFoundException;
import com.ssafy.bgs.user.repository.UserRepository;
import com.ssafy.bgs.mygym.repository.CoinHistoryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final VoteRepository voteRepository;
    private final WorkoutRecordRepository workoutRecordRepository;
    private final UserRepository userRepository;
    private final ImageService imageService;
    private final CoinHistoryRepository coinHistoryRepository;
    private final EvaluationCommentRepository evaluationCommentRepository;

    public List<EvaluationFeedResponseDto> getFeedList(Boolean closed, int page, int pageSize) {
        List<EvaluationFeedResponseDto> feedList = new ArrayList<>();
        Pageable pageable = PageRequest.of(page - 1, pageSize, Sort.by("createdAt").descending());


        Page<Evaluation> evaluations;
        if (closed == null) {
            evaluations = evaluationRepository.findByDeletedFalse(pageable);
        }
        else {
            evaluations = evaluationRepository.findByDeletedFalseAndClosed(closed, pageable);
        }
        evaluations.forEach(evaluation -> {
            EvaluationFeedResponseDto responseDto = new EvaluationFeedResponseDto();
            responseDto.setEvaluationId(evaluation.getEvaluationId());
            feedList.add(responseDto);
        });

        feedList.forEach(feed -> {
            // 이미지 조회
            ImageResponseDto image = imageService.getImage("evaluation", feed.getEvaluationId());
            if (image != null) {
                feed.setImageUrl(imageService.getS3Url(image.getThumbnailUrl()));
            }

            // 투표 수 조회
            feed.setVoteCount(voteRepository.countByEvaluationId(feed.getEvaluationId()));
            feed.setApprovalCount(voteRepository.countByEvaluationIdAndApprovalTrue(feed.getEvaluationId()));
        });

        return feedList;
    }

    /**
     * 평가 게시물 전체 조회 (페이징 지원)
     */
    @Transactional
    public Page<EvaluationResponseDto> getAllEvaluations(Pageable pageable, Boolean closed) {
        Page<Evaluation> evaluations;

        if (closed == null) {
            evaluations = evaluationRepository.findByDeletedFalse(pageable); // 삭제되지 않은 모든 게시물
        } else {
            evaluations = evaluationRepository.findByDeletedFalseAndClosed(closed, pageable); // 삭제되지 않고 투표 완료 여부 필터링
        }

        return evaluations.map(this::convertToDto);
    }


    /**
     * 평가 게시물 상세 조회
     */
    @Transactional
    public EvaluationResponseDto getEvaluationById(Integer evaluationId, Integer userId) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new EvaluationNotFoundException(evaluationId));

        // 🔴 삭제된 게시물은 조회 불가
        if (Boolean.TRUE.equals(evaluation.getDeleted())) {
            throw new EvaluationNotFoundException(evaluationId);
        }

        User writer = userRepository.findById(evaluation.getUserId()).orElseThrow(() -> new UserNotFoundException(evaluation.getUserId()));

        List<String> imageUrls = imageService.getImages("evaluation", evaluationId)
                .stream()
                .map(Image::getUrl)
                .map(imageService::getS3Url)
                .collect(Collectors.toList());

        EvaluationResponseDto responseDto = convertToDto(evaluation);

        // 작성자, 작성자 투표 여부 조회
        responseDto.setWriter(writer.getNickname());
        Optional<Vote> voted = voteRepository.findById(new VoteId(evaluationId, userId));
        voted.ifPresent(vote -> responseDto.setVoted(vote.getApproval()));

        // 투표수 조회
        responseDto.setVoteCount(voteRepository.countByEvaluationId(evaluationId));
        responseDto.setApprovalCount(voteRepository.countByEvaluationIdAndApprovalTrue(evaluationId));

        // 이미지 조회
        responseDto.setImageUrls(imageUrls);
        ImageResponseDto image = imageService.getImage("profile", writer.getId());
        if (image != null) {
            responseDto.setProfileImageUrl(imageService.getS3Url(image.getUrl()));
        }
        return responseDto;
    }


    /**
     * 평가 게시물 등록 (이미지 포함)
     * 평가 게시글 작성 시 하루 한 번만 코인 +1 지급
     */
    @Transactional
    public EvaluationResponseDto createEvaluation(Integer userId, EvaluationRequestDto dto, List<MultipartFile> images) {
        // 오늘 작성된 평가 게시물이 있는지 확인 (오늘 00:00 ~ 23:59:59.999)
        Timestamp startOfToday = Timestamp.valueOf(LocalDate.now().atStartOfDay());
        Timestamp endOfToday = Timestamp.valueOf(LocalDate.now().atTime(LocalTime.MAX));
        boolean hasEvaluationToday = evaluationRepository.existsByUserIdAndCreatedAtBetween(userId, startOfToday, endOfToday);

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

        // 오늘 첫 평가 게시물 작성이면 코인 지급
        if (!hasEvaluationToday) {
            giveCoinForEvaluation(userId, savedEvaluation.getEvaluationId());
        }

        if (images != null && !images.isEmpty()) {
                images.forEach(image -> {
                    imageService.uploadImageWithThumbnail(image, "evaluation", Long.valueOf(savedEvaluation.getEvaluationId()));
                });
            }

        return convertToDto(savedEvaluation);
    }

    /**
     * 하루 한 번 평가 게시글 작성 보상 (코인 +1)
     */
    private void giveCoinForEvaluation(Integer userId, Integer evaluationId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        user.setCoin((user.getCoin() == null ? 0 : user.getCoin()) + 1);
        userRepository.save(user);

        CoinHistory coinHistory = new CoinHistory();
        coinHistory.setUserId(userId);
        coinHistory.setAmount(1); // 1 코인 지급
        coinHistory.setUsageType("EVALUATION");
        coinHistory.setUsageId(evaluationId);
        coinHistoryRepository.save(coinHistory);
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

        // 🔹 기존 이미지 조회
        List<Image> existingImages = imageService.getImages("evaluation", evaluationId);

        // 🔹 사용되지 않는 이미지 삭제
        for (Image image : existingImages) {
            if (existingImageUrls == null || !existingImageUrls.contains(imageService.getS3Url(image.getUrl()))) {
                imageService.deleteImage(image.getImageId());
                image.setDeleted(true);
            }
        }

        // 🔹 새로운 이미지 업로드
        if (newImages != null && !newImages.isEmpty())
            newImages.forEach(image -> {
                imageService.uploadImageWithThumbnail(image, "evaluation", Long.valueOf(evaluationId));
            });

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

        User user = userRepository.findById(loggedInUserId).orElseThrow(() -> new UserNotFoundException(loggedInUserId));

        // 1. 본인 게시물이 맞는지 확인
        if (!evaluation.getUserId().equals(loggedInUserId) && !user.getRole().equals("ADMIN")) {
            throw new UnauthorizedAccessException("본인 게시물이 아니므로 삭제할 수 없습니다.");
        }

        // 2. 투표가 시작된 게시물은 삭제 불가
        if (!user.getRole().equals("ADMIN") || Boolean.TRUE.equals(evaluation.getOpened())) {
            throw new UnauthorizedAccessException("투표가 시작된 게시물은 삭제할 수 없습니다.");
        }

        // 3. Soft Delete 처리: deleted = true 로 변경
        evaluation.setDeleted(true);
        evaluationRepository.save(evaluation);

        // 4. 이미지 삭제
        List<Image> images = imageService.getImages("evaluation", evaluationId);
        for (Image image : images) {
            imageService.deleteImage(image.getImageId());
        }
    }

    /**
     * 투표하기
     */
    @Transactional
    public void vote(Integer evaluationId, Integer userId, Boolean approval) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new EvaluationNotFoundException(evaluationId));

        if (Boolean.TRUE.equals(evaluation.getDeleted())) {
            throw new UnauthorizedAccessException("삭제된 게시물에는 투표할 수 없습니다.");
        }
        if (Boolean.TRUE.equals(evaluation.getClosed())) {
            throw new UnauthorizedAccessException("투표가 종료된 게시물에는 투표할 수 없습니다.");
        }

        VoteId voteId = new VoteId(evaluationId, userId);
        Vote existingVote = voteRepository.findById(voteId).orElse(null);

        // 투표 취소 처리
        if (approval == null) {
            if (existingVote != null) {
                voteRepository.delete(existingVote);
            } else {
                throw new VoteNotFoundException();
            }
        }
        // 새 투표 또는 기존 투표 수정
        else {
            if (existingVote == null) {
                if (!evaluation.getOpened()) {
                    evaluation.setOpened(true);
                    evaluationRepository.save(evaluation);
                }
                Vote newVote = Vote.builder()
                        .evaluationId(evaluationId)
                        .userId(userId)
                        .approval(approval)
                        .build();
                voteRepository.save(newVote);
            } else {
                existingVote.setApproval(approval);
                voteRepository.save(existingVote);
            }
        }

        voteRepository.flush();
        closeEvaluation(evaluationId);

        // 투표 후 코인 보상 체크 (보상은 활성 투표 수 기준, 10의 배수마다 지급)
        checkAndRewardVoteCoin(userId, evaluationId);
    }

    /**
     * 활성 투표 수(active vote count)를 기준으로, 10의 배수가 새로 달성되었으면 보상 지급
     * 단, 투표 취소 등으로 인한 재투표 시 중복 지급되지 않도록,
     * 이미 지급된 보상(usageType="VOTE")의 합계와 비교하여 부족분만 지급.
     */
    private void checkAndRewardVoteCoin(Integer userId, Integer evaluationId) {
        // 1. 활성 투표 수: 사용자가 현재 가지고 있는 투표 수 (취소되지 않은 투표)
        long activeVoteCount = voteRepository.countByUserId(userId);

        // 2. 이론상 지급되어야 하는 보상 횟수 (예: 10표이면 1, 20표이면 2, …)
        long rewardTarget = activeVoteCount / 10;

        // 3. 이미 지급된 보상 합계 (usageType "VOTE"만)
        Long alreadyRewarded = coinHistoryRepository.sumAmountByUserIdAndUsageType(userId, "VOTE");
        if (alreadyRewarded == null) {
            alreadyRewarded = 0L;
        }

        // 4. 부족한 보상이 있으면 지급 (한 번에 1 coin씩 지급하는 경우, 보통 newRewards는 1)
        if (rewardTarget > alreadyRewarded) {
            long newRewards = rewardTarget - alreadyRewarded;
            // 업데이트 사용자 코인
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException(userId));
            int currentCoin = user.getCoin() == null ? 0 : user.getCoin();
            user.setCoin(currentCoin + (int)newRewards);
            userRepository.save(user);

            // CoinHistory에 보상 기록 저장 (각 보상 1 coin)
            for (int i = 0; i < newRewards; i++) {
                CoinHistory coinHistory = new CoinHistory();
                coinHistory.setUserId(userId);
                coinHistory.setAmount(1); // 1 coin 보상
                coinHistory.setUsageType("VOTE");
                coinHistory.setUsageId(evaluationId); // 마지막으로 투표를 한 평가게시물 ID 저장
                coinHistoryRepository.save(coinHistory);
            }
            System.out.println("투표 보상 지급: " + newRewards + " coin 지급 (활성 투표 수: " + activeVoteCount + ")");
        }
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
     * 운동 기록 반영 (기존 값보다 클 경우만 업데이트)
     */
    private void reflectWorkoutRecord(Evaluation evaluation) {
        WorkoutRecord record = workoutRecordRepository.findById(evaluation.getUserId())
                .orElseGet(() -> WorkoutRecord.builder()
                        .userId(evaluation.getUserId())
                        .build());

        switch (evaluation.getWorkoutType()) {
            case "SQUAT":
                if (record.getSquat() == null || evaluation.getWeight().compareTo(record.getSquat()) > 0) {
                    record.setSquatEvaluation(evaluation.getEvaluationId());
                    record.setSquat(evaluation.getWeight());
                }
                break;
            case "BENCH":
                if (record.getBenchpress() == null || evaluation.getWeight().compareTo(record.getBenchpress()) > 0) {
                    record.setBenchpressEvaluation(evaluation.getEvaluationId());
                    record.setBenchpress(evaluation.getWeight());
                }
                break;
            case "DEAD":
                if (record.getDeadlift() == null || evaluation.getWeight().compareTo(record.getDeadlift()) > 0) {
                    record.setDeadliftEvaluation(evaluation.getEvaluationId());
                    record.setDeadlift(evaluation.getWeight());
                }
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

    public List<CommentResponseDto> getCommentList(Integer evaluationId) {
        List<CommentResponseDto> comments = evaluationCommentRepository.findCommentsByEvaluationId(evaluationId);

        comments.forEach(comment -> {
            ImageResponseDto image = imageService.getImage("profile", comment.getUserId());
            if (image != null)
                comment.setProfileUrl(imageService.getS3Url(image.getUrl()));
        });

        return comments;
    }

    public void addComment(CommentRequestDto commentRequestDto) {
        EvaluationComment comment = new EvaluationComment();
        comment.setEvaluationId(commentRequestDto.getDiaryId());
        comment.setUserId(commentRequestDto.getUserId());
        comment.setContent(commentRequestDto.getContent());
        evaluationCommentRepository.save(comment);
    }

    /**
     * Comment update
     **/
    public void updateComment(CommentRequestDto commentRequestDto) {
        // 댓글 미존재
        EvaluationComment comment = evaluationCommentRepository.findById(commentRequestDto.getCommentId()).orElseThrow(() -> new CommentNotFoundException(commentRequestDto.getCommentId()));

        // 댓글 수정 권한 없음
        if (!comment.getUserId().equals(commentRequestDto.getUserId()))
            throw new UnauthorizedAccessException("댓글 수정 권한 없음") {
            };
        comment.setContent(commentRequestDto.getContent());
        evaluationCommentRepository.save(comment);
    }

    /**
     * Comment delete
     **/
    public void deleteComment(Integer userId, Integer commentId) {
        // 댓글 미존재
        EvaluationComment comment = evaluationCommentRepository.findById(commentId).orElse(null);
        if (comment == null || comment.getDeleted()) {
            throw new CommentNotFoundException(commentId);
        }

        User user = userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));

        // 댓글 삭제 권한 없음
        if (!comment.getUserId().equals(userId) && !user.getRole().equals("ADMIN"))
            throw new UnauthorizedAccessException("댓글 삭제 권한 없음") {
            };

        comment.setDeleted(true);
        evaluationCommentRepository.save(comment);
    }
}
