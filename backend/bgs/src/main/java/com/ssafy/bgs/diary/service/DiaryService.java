package com.ssafy.bgs.diary.service;

import com.ssafy.bgs.common.UnauthorizedAccessException;
import com.ssafy.bgs.diary.dto.request.CommentRequestDto;
import com.ssafy.bgs.diary.dto.request.DiaryRequestDto;
import com.ssafy.bgs.diary.dto.request.DiaryWorkoutRequestDto;
import com.ssafy.bgs.diary.dto.request.WorkoutSetRequestDto;
import com.ssafy.bgs.diary.dto.response.*;
import com.ssafy.bgs.diary.entity.*;
import com.ssafy.bgs.diary.exception.CommentNotFoundException;
import com.ssafy.bgs.diary.exception.DiaryNotFoundException;
import com.ssafy.bgs.diary.exception.DiaryWorkoutNotFoundException;
import com.ssafy.bgs.diary.exception.WorkoutSetNotFoundException;
import com.ssafy.bgs.diary.repository.*;
import com.ssafy.bgs.image.dto.response.ImageResponseDto;
import com.ssafy.bgs.image.entity.Image;
import com.ssafy.bgs.image.service.ImageService;
import com.ssafy.bgs.mygym.entity.CoinHistory;
import com.ssafy.bgs.mygym.repository.CoinHistoryRepository;
import com.ssafy.bgs.user.entity.User;
import com.ssafy.bgs.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DiaryService {
    private final DiaryRepository diaryRepository;
    private final DiaryWorkoutRepository diaryWorkoutRepository;
    private final WorkoutSetRepository workoutSetRepository;
    private final DiaryLikedRepository diaryLikedRepository;
    private final HashtagRepository hashtagRepository;
    private final CommentRepository commentRepository;
    private final ImageService imageService;
    private final UserRepository userRepository;
    private final WorkoutRepository workoutRepository;
    private final CoinHistoryRepository coinHistoryRepository;


    public DiaryService(DiaryRepository diaryRepository, DiaryWorkoutRepository diaryWorkoutRepository, WorkoutSetRepository workoutSetRepository, DiaryLikedRepository diaryLikedRepository, HashtagRepository hashtagRepository, CommentRepository commentRepository, ImageService imageService, UserRepository userRepository, WorkoutRepository workoutRepository, CoinHistoryRepository coinHistoryRepository) {
        this.diaryRepository = diaryRepository;
        this.diaryWorkoutRepository = diaryWorkoutRepository;
        this.workoutSetRepository = workoutSetRepository;
        this.diaryLikedRepository = diaryLikedRepository;
        this.hashtagRepository = hashtagRepository;
        this.commentRepository = commentRepository;
        this.imageService = imageService;
        this.userRepository = userRepository;
        this.workoutRepository = workoutRepository;
        this.coinHistoryRepository = coinHistoryRepository;
    }

    /**
     * Feed select
     **/
    public List<DiaryFeedResponseDto> getFeedList(Integer readerId, Integer userId, String hashtag, int page, int pageSize) {
        List<DiaryFeedResponseDto> feedList;
        Pageable pageable = PageRequest.of(page - 1, pageSize);

        // 조회 범위 설정
        if (userId == null) { // 전체 조회
            if (hashtag == null || hashtag.isEmpty())
                feedList = diaryRepository.findByAllowedScopeAndDeletedFalse("A", pageable);
            else
                feedList = diaryRepository.findByAllowedScopeAndDeletedFalse("A", hashtag, pageable);
        } else if (readerId.equals(userId)) { // 내 피드 조회
            feedList = diaryRepository.findByUserIdAndDeletedFalse(userId, pageable);
        } else { // 남 피드 조회
            feedList = diaryRepository.findByUserIdAndAllowedScopeAndDeletedFalse(userId, "A", pageable);
        }

        feedList.forEach(diary -> {
            // 이미지 조회
            ImageResponseDto image = imageService.getImage("diary", diary.getDiaryId());
            if (image != null) {
                diary.setImageUrl(imageService.getS3Url(image.getThumbnailUrl()));
            }

            // 좋아요 수 조회
            diary.setLikedCount(diaryLikedRepository.countDiaryLikedByIdDiaryId(diary.getDiaryId()));

            // 댓글 수 조회
            diary.setCommentCount(commentRepository.countCommentByDiaryId(diary.getDiaryId()));
        });

        return feedList;
    }

    /**
     * Diary select
     **/
    public List<Diary> getDiaryList(Integer userId, int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        return diaryRepository.findByUserIdAndWorkoutDateBetweenAndDeletedFalse(userId, startDate, endDate);
    }

    /**
     * Diary insert
     * 다이어리 작성 시 하루 한 번만 코인 +1 지급
     **/
    @Transactional
    public void addDiary(DiaryRequestDto diaryRequestDto, List<MultipartFile> files) {
        Integer userId = diaryRequestDto.getUserId();
        // 오늘 기준 생성 시간 범위로 오늘 작성한 다이어리가 있는지 확인
        LocalDateTime startOfToday = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime endOfToday = LocalDateTime.now().with(LocalTime.MAX);
        boolean hasDiaryToday = diaryRepository.existsByUserIdAndCreatedAtBetween(userId, startOfToday, endOfToday);

        // 운동 다이어리 column 입력 (workoutDate는 사용자가 입력한 값)
        Diary diary = new Diary();
        diary.setUserId(diaryRequestDto.getUserId());
        diary.setContent(diaryRequestDto.getContent());
        diary.setWorkoutDate(diaryRequestDto.getWorkoutDate());
        diary.setAllowedScope(diaryRequestDto.getAllowedScope());
        Diary savedDiary = diaryRepository.save(diary);

        // 코인 지급: 오늘 첫 다이어리 작성이라면 지급
        if (!hasDiaryToday) {
            giveCoinForDiary(userId, savedDiary.getDiaryId());
        }

        // 해시태그 저장
        saveHashtags(diaryRequestDto.getHashtags(), savedDiary.getDiaryId());

        // 운동 목록 저장
        List<DiaryWorkout> diaryWorkouts = addDiaryWorkouts(diaryRequestDto.getDiaryWorkouts(), savedDiary);
        List<DiaryWorkout> savedDiaryWorkouts = diaryWorkoutRepository.saveAll(diaryWorkouts);

        // 운동 세트 저장
        List<WorkoutSet> workoutSets = addWorkoutSets(diaryRequestDto.getDiaryWorkouts(), savedDiaryWorkouts);
        workoutSetRepository.saveAll(workoutSets);

        // 이미지 저장
        if (files != null && !files.isEmpty())
            files.forEach(file -> {
                imageService.uploadImageWithThumbnail(file, "diary", Long.valueOf(savedDiary.getDiaryId()));
            });
    }

    /**
     * 하루 한 번 다이어리 작성 보상 (코인 +1)
     **/
    private void giveCoinForDiary(Integer userId, Integer diaryId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        // 코인 +1 증가 (null 체크는 필요 시 추가)
        user.setCoin((user.getCoin() == null ? 0 : user.getCoin()) + 1);
        userRepository.save(user);

        // CoinHistory 기록 저장
        CoinHistory coinHistory = new CoinHistory();
        coinHistory.setUserId(userId);
        coinHistory.setAmount(1); // 1 코인 지급
        coinHistory.setUsageType("DIARY");
        coinHistory.setUsageId(diaryId);
        coinHistoryRepository.save(coinHistory);
    }

    /**
     * diaryId를 키로 Hashtag insert
     **/
    private void saveHashtags(List<String> inputHashtags, Integer diaryId) {
        List<Hashtag> hashtags = new ArrayList<>();
        inputHashtags.forEach(item -> {
            Hashtag hashtag = new Hashtag();

            // 복합키 ID 객체 생성 및 설정
            HashtagId hashtagId = new HashtagId(diaryId, item);

            hashtag.setId(hashtagId);
            hashtags.add(hashtag);
        });
        hashtagRepository.saveAll(hashtags);
    }

    /**
     * DB에 추가할 운동 목록 리스트 반환
     **/
    private List<DiaryWorkout> addDiaryWorkouts(List<DiaryWorkoutRequestDto> workouts, Diary diary) {
        List<DiaryWorkout> diaryWorkouts = new ArrayList<>();
        for (DiaryWorkoutRequestDto workoutRequestDto : workouts) {
            // DiaryWorkout column 입력
            DiaryWorkout diaryWorkout = new DiaryWorkout();
            diaryWorkout.setDiaryId(diary.getDiaryId());
            diaryWorkout.setWorkoutId(workoutRequestDto.getWorkoutId());
            diaryWorkouts.add(diaryWorkout);
        }

        return diaryWorkouts;
    }

    /**
     * DB에 추가할 운동 세트 리스트 반환
     **/
    private List<WorkoutSet> addWorkoutSets(List<DiaryWorkoutRequestDto> workouts, List<DiaryWorkout> savedDiaryWorkouts) {
        List<WorkoutSet> workoutSets = new ArrayList<>();
        int i = 0;
        for (DiaryWorkoutRequestDto workoutRequestDto : workouts) {
            for (WorkoutSetRequestDto setRequestDto : workoutRequestDto.getSets()) {
                WorkoutSet workoutSet = new WorkoutSet();
                // WorkoutSet column 입력
                workoutSet.setDiaryWorkoutId(savedDiaryWorkouts.get(i).getDiaryWorkoutId());
                workoutSet.setWeight(setRequestDto.getWeight());
                workoutSet.setRepetition(setRequestDto.getRepetition());
                workoutSet.setWorkoutTime(setRequestDto.getWorkoutTime());
                workoutSets.add(workoutSet);
            }
            i++;
        }
        return workoutSets;
    }

    public Long getDiaryCount(Integer readerId, Integer userId) {
        if (readerId.equals(userId))
            return diaryRepository.countByUserIdAndDeletedFalse(userId);
        else
            return diaryRepository.countByUserIdAndAllowedScopeAndDeletedFalse(userId, "A");
    }

    /**
     * Diary 단건 조회
     **/
    @Transactional
    public DiaryResponseDto getDiary(Integer viewerId, Integer diaryId) {
        DiaryResponseDto diaryResponseDto = new DiaryResponseDto();

        // 1) 다이어리 기본 조회
        Diary diary = diaryRepository.findById(diaryId).orElse(null);
        if (diary == null || diary.getDeleted()) {
            throw new DiaryNotFoundException(diaryId);
        }

        diaryResponseDto.setDiaryId(diary.getDiaryId());
        diaryResponseDto.setUserId(diary.getUserId());
        diaryResponseDto.setWorkoutDate(diary.getWorkoutDate());
        diaryResponseDto.setContent(diary.getContent());
        diaryResponseDto.setAllowedScope(diary.getAllowedScope());
        diaryResponseDto.setCreatedAt(diary.getCreatedAt());
        diaryResponseDto.setModifiedAt(diary.getModifiedAt());

        // 2) 작성자 정보
        User writer = userRepository.findById(diaryResponseDto.getUserId()).orElse(null);
        if (writer != null) {
            diaryResponseDto.setWriter(writer.getNickname());
            ImageResponseDto profileImage = imageService.getImage("profile", writer.getId());
            if (profileImage != null) {
                diaryResponseDto.setProfileImageUrl(imageService.getS3Url(profileImage.getUrl()));
            }
        }

        // 3) 좋아요 여부 & 개수
        DiaryLiked diaryLiked = diaryLikedRepository.findById(new DiaryLikedId(diaryId, viewerId)).orElse(null);
        diaryResponseDto.setIsLiked(diaryLiked != null);
        diaryResponseDto.setLikedCount(diaryLikedRepository.countDiaryLikedByIdDiaryId(diaryId));

        // 4) 해시태그
        List<Hashtag> hashtags = hashtagRepository.findByIdDiaryId(diaryId);
        for (Hashtag hashtag : hashtags) {
            diaryResponseDto.getHashtags().add(hashtag.getId().getTag());
        }

        // 5) DiaryWorkout 조회
        List<DiaryWorkout> diaryWorkouts = diaryWorkoutRepository.findByDiaryIdAndDeletedFalse(diaryId);
        for (DiaryWorkout diaryWorkout : diaryWorkouts) {
            DiaryWorkoutResponseDto diaryWorkoutResponseDto = new DiaryWorkoutResponseDto();
            diaryWorkoutResponseDto.setDiaryWorkoutId(diaryWorkout.getDiaryWorkoutId());
            diaryWorkoutResponseDto.setWorkoutId(diaryWorkout.getWorkoutId());
            diaryWorkoutResponseDto.setCreatedAt(diaryWorkout.getCreatedAt());
            diaryWorkoutResponseDto.setModifiedAt(diaryWorkout.getModifiedAt());

            // 5-1) workoutId에 해당하는 Workout 정보 추가 조회
            Workout w = workoutRepository.findById(diaryWorkout.getWorkoutId()).orElse(null);
            if (w != null) {
                diaryWorkoutResponseDto.setWorkoutName(w.getWorkoutName()); // 실제 운동이름
                diaryWorkoutResponseDto.setPart(w.getPart());
            }

            // 6) WorkoutSet 조회
            List<WorkoutSet> workoutSets = workoutSetRepository.findByDiaryWorkoutIdAndDeletedFalse(diaryWorkout.getDiaryWorkoutId());
            for (WorkoutSet workoutSet : workoutSets) {
                WorkoutSetResponseDto workoutSetResponseDto = new WorkoutSetResponseDto();
                workoutSetResponseDto.setWorkoutSetId(workoutSet.getWorkoutSetId());
                workoutSetResponseDto.setWeight(workoutSet.getWeight());
                workoutSetResponseDto.setRepetition(workoutSet.getRepetition());
                workoutSetResponseDto.setWorkoutTime(workoutSet.getWorkoutTime());
                workoutSetResponseDto.setCreatedAt(workoutSet.getCreatedAt());
                workoutSetResponseDto.setModifiedAt(workoutSet.getModifiedAt());

                diaryWorkoutResponseDto.getSets().add(workoutSetResponseDto);
            }

            // 7) 위에서 완성된 workoutResponseDto를 최종 추가
            diaryResponseDto.getDiaryWorkouts().add(diaryWorkoutResponseDto);
        }

        // 8) 이미지 조회
        List<Image> images = imageService.getImages("diary", diaryId);
        for (Image image : images) {
            ImageResponseDto imageResponseDto = new ImageResponseDto();
            imageResponseDto.setImageId(image.getImageId());
            imageResponseDto.setUrl(imageService.getS3Url(image.getUrl()));
            imageResponseDto.setExtension(image.getExtension());
            diaryResponseDto.getImages().add(imageResponseDto);
        }

        return diaryResponseDto;
    }


    /**
     * Diary update
     **/
    @Transactional
    public void updateDiary(Integer userId, DiaryRequestDto diaryRequestDto, List<String> urls, List<MultipartFile> files) {
        // 1. 기존 다이어리 조회 및 수정 권한 체크
        Diary existingDiary = diaryRepository.findById(diaryRequestDto.getDiaryId())
                .orElseThrow(() -> new DiaryNotFoundException(diaryRequestDto.getDiaryId()));
        if (existingDiary.getDeleted() || !existingDiary.getUserId().equals(userId)) {
            throw new UnauthorizedAccessException("다이어리 수정 권한 없음");
        }

        // 2. 다이어리 컬럼 업데이트
        existingDiary.setWorkoutDate(diaryRequestDto.getWorkoutDate());
        existingDiary.setContent(diaryRequestDto.getContent());
        existingDiary.setAllowedScope(diaryRequestDto.getAllowedScope());
        Diary savedDiary = diaryRepository.save(existingDiary);

        // 3. 해시태그 업데이트: 기존 해시태그 삭제 후 새 해시태그 저장
        hashtagRepository.deleteAllByIdDiaryId(savedDiary.getDiaryId());
        saveHashtags(diaryRequestDto.getHashtags(), savedDiary.getDiaryId());

        // 4. 기존 DiaryWorkout 중 클라이언트에 없는 항목은 soft delete 처리
        List<DiaryWorkout> currentWorkouts = diaryWorkoutRepository.findByDiaryIdAndDeletedFalse(savedDiary.getDiaryId());
        Set<Integer> incomingDiaryWorkoutIds = diaryRequestDto.getDiaryWorkouts().stream()
                .filter(dw -> dw.getDiaryWorkoutId() != null)
                .map(DiaryWorkoutRequestDto::getDiaryWorkoutId)
                .collect(Collectors.toSet());
        for (DiaryWorkout dw : currentWorkouts) {
            if (!incomingDiaryWorkoutIds.contains(dw.getDiaryWorkoutId())) {
                dw.setDeleted(true);
            }
        }
        diaryWorkoutRepository.saveAll(currentWorkouts);

        // 5. 업데이트할 DiaryWorkout들을 병합 처리 (업데이트 + 신규 INSERT)
        List<DiaryWorkout> updatedWorkouts = new ArrayList<>();
        for (DiaryWorkoutRequestDto workoutDto : diaryRequestDto.getDiaryWorkouts()) {
            DiaryWorkout dw;
            if (workoutDto.getDiaryWorkoutId() != null) {
                dw = diaryWorkoutRepository.findById(workoutDto.getDiaryWorkoutId())
                        .orElseThrow(() -> new DiaryWorkoutNotFoundException(workoutDto.getDiaryWorkoutId()));
                dw.setWorkoutId(workoutDto.getWorkoutId());
                dw.setDeleted(Boolean.TRUE.equals(workoutDto.getDeleted()));
            } else {
                dw = new DiaryWorkout();
                dw.setDiaryId(savedDiary.getDiaryId());
                dw.setWorkoutId(workoutDto.getWorkoutId());
                dw.setDeleted(Boolean.TRUE.equals(workoutDto.getDeleted()));
            }
            updatedWorkouts.add(dw);
        }
        List<DiaryWorkout> savedDiaryWorkouts = diaryWorkoutRepository.saveAll(updatedWorkouts);

        // 6. 운동 세트 업데이트
        // → 기존 세트를 모두 soft delete한 후, 클라이언트에서 온 세트 정보로 새로 INSERT
        List<WorkoutSet> newWorkoutSets = new ArrayList<>();
        for (DiaryWorkoutRequestDto workoutDto : diaryRequestDto.getDiaryWorkouts()) {
            // 만약 해당 운동이 삭제된 상태이면 세트는 무시
            if (Boolean.TRUE.equals(workoutDto.getDeleted()))
                continue;
            // matching DiaryWorkout 찾기 (기존 항목: diaryWorkoutId, 신규 항목: workoutId로 비교)
            DiaryWorkout matchingWorkout = null;
            if (workoutDto.getDiaryWorkoutId() != null) {
                matchingWorkout = savedDiaryWorkouts.stream()
                        .filter(dw -> dw.getDiaryWorkoutId().equals(workoutDto.getDiaryWorkoutId()))
                        .findFirst().orElse(null);
            } else {
                matchingWorkout = savedDiaryWorkouts.stream()
                        .filter(dw -> dw.getWorkoutId().equals(workoutDto.getWorkoutId()))
                        .findFirst().orElse(null);
            }
            if (matchingWorkout == null) continue;
            // 기존 세트 모두 soft delete 처리
            List<WorkoutSet> existingSets = workoutSetRepository.findByDiaryWorkoutIdAndDeletedFalse(matchingWorkout.getDiaryWorkoutId());
            for (WorkoutSet ws : existingSets) {
                ws.setDeleted(true);
            }
            workoutSetRepository.saveAll(existingSets);
            // 새로 들어온 세트들을 INSERT
            if (workoutDto.getSets() != null) {
                for (WorkoutSetRequestDto setDto : workoutDto.getSets()) {
                    // 만약 클라이언트에서 삭제 표시한 세트라면 건너뛰기 (삭제된 세트는 저장하지 않음)
                    if (Boolean.TRUE.equals(setDto.getDeleted())) continue;
                    WorkoutSet newSet = new WorkoutSet();
                    newSet.setDiaryWorkoutId(matchingWorkout.getDiaryWorkoutId());
                    newSet.setWeight(setDto.getWeight());
                    newSet.setRepetition(setDto.getRepetition());
                    newSet.setWorkoutTime(setDto.getWorkoutTime());
                    newSet.setDeleted(false);
                    newWorkoutSets.add(newSet);
                }
            }
        }
        workoutSetRepository.saveAll(newWorkoutSets);

        // 7. 이미지 처리 (기존 이미지 유지/삭제 및 새 이미지 업로드)
        List<Image> currentImages = imageService.getImages("diary", savedDiary.getDiaryId());
        for (Image image : currentImages) {
            if (urls == null || !urls.contains(imageService.getS3Url(image.getUrl()))) {
                imageService.deleteImage(image.getImageId());
            }
        }
        if (files != null && !files.isEmpty())
            files.forEach(file -> {
                imageService.uploadImageWithThumbnail(file, "diary", Long.valueOf(savedDiary.getDiaryId()));
            });
    }


    /**
     * DB에 업데이트할 운동 목록 리스트 반환
     **/
    private List<DiaryWorkout> updateDiaryWorkouts(List<DiaryWorkoutRequestDto> workouts, Diary savedDiary) {
        List<DiaryWorkout> diaryWorkouts = new ArrayList<>();
        for (DiaryWorkoutRequestDto workoutRequestDto : workouts) {
            DiaryWorkout existingDiaryWorkout;
            // 새로운 운동 목록
            if (workoutRequestDto.getDiaryWorkoutId() == null) {
                existingDiaryWorkout = new DiaryWorkout();
                existingDiaryWorkout.setDiaryId(savedDiary.getDiaryId());
            }
            // 기존 운동 목록
            else {
                existingDiaryWorkout = diaryWorkoutRepository.findById(workoutRequestDto.getDiaryWorkoutId()).orElseThrow(() -> new DiaryWorkoutNotFoundException(workoutRequestDto.getDiaryWorkoutId()));
            }

            // DiaryWorkout column 수정
            existingDiaryWorkout.setWorkoutId(workoutRequestDto.getWorkoutId());
            existingDiaryWorkout.setDeleted(workoutRequestDto.getDeleted());

            // 리스트에 추가
            diaryWorkouts.add(existingDiaryWorkout);
        }

        return diaryWorkouts;
    }

    /**
     * DB에 업데이트할 운동 세트 리스트 반환
     **/
    private List<WorkoutSet> updateWorkoutSets(List<DiaryWorkoutRequestDto> workouts, List<DiaryWorkout> savedDiaryWorkouts) {
        List<WorkoutSet> workoutSets = new ArrayList<>();
        int i = 0;
        for (DiaryWorkoutRequestDto workoutRequestDto : workouts) {
            // 삭제된 운동이면 건너뛰기 - null이면 false로 처리
            if (Boolean.TRUE.equals(workoutRequestDto.getDeleted()))
                continue;

            for (WorkoutSetRequestDto setRequestDto : workoutRequestDto.getSets()) {
                WorkoutSet existingWorkoutSet;
                if (setRequestDto.getWorkoutSetId() == null) {
                    existingWorkoutSet = new WorkoutSet();
                    existingWorkoutSet.setDiaryWorkoutId(savedDiaryWorkouts.get(i).getDiaryWorkoutId());
                } else {
                    existingWorkoutSet = workoutSetRepository.findById(setRequestDto.getWorkoutSetId())
                            .orElseThrow(() -> new WorkoutSetNotFoundException(setRequestDto.getWorkoutSetId()));
                }

                existingWorkoutSet.setDiaryWorkoutId(savedDiaryWorkouts.get(i).getDiaryWorkoutId());
                existingWorkoutSet.setWeight(setRequestDto.getWeight());
                existingWorkoutSet.setRepetition(setRequestDto.getRepetition());
                existingWorkoutSet.setWorkoutTime(setRequestDto.getWorkoutTime());
                existingWorkoutSet.setDeleted(setRequestDto.getDeleted());

                workoutSets.add(existingWorkoutSet);
            }
            i++;
        }
        return workoutSets;
    }


    /**
     * Diary Delete
     **/
    public void deleteDiary(Integer userId, Integer diaryId) {
        // 다이어리 미존재
        Diary diary = diaryRepository.findById(diaryId).orElse(null);
        if (diary == null || diary.getDeleted()) {
            throw new DiaryNotFoundException(diaryId);
        }

        // 다이어리 삭제 권한 없음
        if (!diary.getUserId().equals(userId))
            throw new UnauthorizedAccessException("다이어리 삭제 권한 없음") {
            };

        // Diary soft delete
        diary.setDeleted(true);
        diaryRepository.save(diary);

        // Image soft delete
        List<Image> images = imageService.getImages("diary", diaryId);
        for (Image image : images) {
            imageService.deleteImage(image.getImageId());
        }
    }

    /**
     * 게시물 좋아요
     **/
    public void likeDiary(Integer userId, Integer diaryId) {
        DiaryLikedId diaryLikedId = new DiaryLikedId(diaryId, userId);
        DiaryLiked diaryLiked = new DiaryLiked();
        diaryLiked.setId(diaryLikedId);
        diaryLikedRepository.save(diaryLiked);
    }

    /**
     * 게시물 좋아요 취소
     **/
    public void unlikeDiary(Integer userId, Integer diaryId) {
        DiaryLikedId diaryLikedId = new DiaryLikedId(diaryId, userId);
        diaryLikedRepository.deleteById(diaryLikedId);
    }

    /**
     * Comment select
     **/
    public List<CommentResponseDto> getCommentList(Integer diaryId) {
        return commentRepository.findCommentsByDiaryId(diaryId);
    }

    /**
     * Comment insert
     **/
    public void addComment(CommentRequestDto commentRequestDto) {
        Comment comment = new Comment();
        comment.setDiaryId(commentRequestDto.getDiaryId());
        comment.setUserId(commentRequestDto.getUserId());
        comment.setContent(commentRequestDto.getContent());
        commentRepository.save(comment);
    }

    /**
     * Comment update
     **/
    public void updateComment(CommentRequestDto commentRequestDto) {
        // 댓글 미존재
        Comment comment = commentRepository.findById(commentRequestDto.getCommentId()).orElseThrow(() -> new CommentNotFoundException(commentRequestDto.getCommentId()));

        // 댓글 수정 권한 없음
        if (!comment.getUserId().equals(commentRequestDto.getUserId()))
            throw new UnauthorizedAccessException("댓글 수정 권한 없음") {
            };
        comment.setContent(commentRequestDto.getContent());
        commentRepository.save(comment);
    }

    /**
     * Comment delete
     **/
    public void deleteComment(Integer userId, Integer commentId) {
        // 댓글 미존재
        Comment comment = commentRepository.findById(commentId).orElse(null);
        if (comment == null || comment.getDeleted()) {
            throw new CommentNotFoundException(commentId);
        }

        // 댓글 삭제 권한 없음
        if (!comment.getUserId().equals(userId))
            throw new UnauthorizedAccessException("댓글 삭제 권한 없음") {
            };

        comment.setDeleted(true);
        commentRepository.save(comment);
    }

    // 모든 운동 데이터 가져오기
    public List<Workout> getAllWorkouts() {
        return workoutRepository.findAll();
    }

    // 운동 데이터 검색
    public List<Workout> searchWorkouts(String keyword) {
        return workoutRepository.findByWorkoutNameContainingIgnoreCase(keyword);
    }

    /**
     * 이전 운동 기록 조회 (최신순, 최대 limit 건)
     * 한 다이어리에 여러 운동이 들어가 있으면, 한 번에 묶어서 반환
     */
    public List<PreviousWorkoutResponseDto> getPreviousWorkoutRecords(Integer userId, int limit) {
        // (1) 사용자(userId)가 작성한, 삭제되지 않은 다이어리 전부 조회
        List<Diary> diaries = diaryRepository.findByUserIdAndDeletedFalse(userId);

        // (2) 날짜 내림차순, diaryId 내림차순 정렬
        diaries.sort((d1, d2) -> {
            int cmp = d2.getWorkoutDate().compareTo(d1.getWorkoutDate());
            if (cmp == 0) {
                cmp = d2.getDiaryId().compareTo(d1.getDiaryId());
            }
            return cmp;
        });

        List<PreviousWorkoutResponseDto> result = new ArrayList<>();

        // (3) 각 다이어리에 대해
        for (Diary diary : diaries) {
            // 연결된 DiaryWorkout들 (운동 목록)
            List<DiaryWorkout> dwList = diaryWorkoutRepository.findByDiaryIdAndDeletedFalse(diary.getDiaryId());
            if (dwList.isEmpty()) continue; // 운동이 없으면 패스

            // (4) 한 다이어리를 하나로 묶을 DTO 생성
            PreviousWorkoutResponseDto dto = new PreviousWorkoutResponseDto();

            // 대표값들
            dto.setDiaryId(diary.getDiaryId());
            dto.setDiaryWorkoutId(dwList.get(0).getDiaryWorkoutId()); // 첫 번째를 대표 ID로
            dto.setWorkoutDate(java.sql.Date.valueOf(diary.getWorkoutDate().toLocalDate()));

            // 여러 운동 이름/부위/기구 등을 합칠 리스트들
            List<Integer> wIds = new ArrayList<>();
            List<String> wNames = new ArrayList<>();
            List<String> wParts = new ArrayList<>();
            List<String> wTools = new ArrayList<>();

            // 다이어리에 포함된 모든 세트 정보를 모을 통합 리스트
            List<WorkoutSetResponseDto> allSets = new ArrayList<>();

            // (5) 각 DiaryWorkout을 순회하며 workout 정보, set 정보 수집
            for (DiaryWorkout dw : dwList) {
                Workout w = workoutRepository.findById(dw.getWorkoutId()).orElse(null);
                if (w == null) continue;
                wIds.add(w.getWorkoutId());
                wNames.add(w.getWorkoutName());
                wParts.add(w.getPart());
                wTools.add(w.getTool());

                // 해당 운동에 딸린 세트들
                List<WorkoutSet> sets = workoutSetRepository.findByDiaryWorkoutIdAndDeletedFalse(dw.getDiaryWorkoutId());
                for (WorkoutSet ws : sets) {
                    // WorkoutSetResponseDto로 변환
                    WorkoutSetResponseDto wsDto = new WorkoutSetResponseDto();
                    wsDto.setWorkoutSetId(ws.getWorkoutSetId());
                    wsDto.setWorkoutId(dw.getWorkoutId());  // <-- 어떤 workoutId 소속인지
                    wsDto.setWeight(ws.getWeight());
                    wsDto.setRepetition(ws.getRepetition());
                    wsDto.setWorkoutTime(ws.getWorkoutTime());
                    wsDto.setCreatedAt(ws.getCreatedAt());
                    wsDto.setModifiedAt(ws.getModifiedAt());
                    allSets.add(wsDto);
                }
            }

            // (6) 수집한 정보들을 DTO에 세팅
            dto.setWorkoutIds(wIds);
            dto.setWorkoutName(String.join(", ", wNames));
            dto.setPart(String.join(", ", wParts));
            dto.setTool(String.join(", ", wTools));
            dto.setSets(allSets);

            // 평균/합산 등을 따로 계산하고 싶다면 dto.setWeight() 등에 넣을 수도 있음
            dto.setWeight(null);
            dto.setRepetition(null);
            dto.setWorkoutTime(null);

            // 리스트에 추가
            result.add(dto);

            // limit 개수까지
            if (result.size() >= limit) break;
        }

        return result;
    }


    /**
     * 최근 운동 조회 (최신순, 최대 limit 건)
     * 중복 운동은 제거하고, 가장 최근에 등록한 DiaryWorkout 기준으로 반환
     */
    public List<RecentWorkoutResponseDto> getRecentWorkouts(Integer userId, int limit) {
        List<Diary> diaries = diaryRepository.findByUserIdAndDeletedFalse(userId);
        diaries.sort((d1, d2) -> {
            if (d1.getWorkoutDate() == null && d2.getWorkoutDate() == null) return 0;
            if (d1.getWorkoutDate() == null) return 1;
            if (d2.getWorkoutDate() == null) return -1;
            return d2.getWorkoutDate().compareTo(d1.getWorkoutDate());
        });
        List<RecentWorkoutResponseDto> result = new ArrayList<>();
        Set<Integer> uniqueWorkoutIds = new HashSet<>();
        for (Diary diary : diaries) {
            List<DiaryWorkout> diaryWorkouts = diaryWorkoutRepository.findByDiaryIdAndDeletedFalse(diary.getDiaryId());
            // diaryWorkouts를 생성시간 내림차순 정렬
            diaryWorkouts.sort((w1, w2) -> w2.getCreatedAt().compareTo(w1.getCreatedAt()));
            for (DiaryWorkout dw : diaryWorkouts) {
                if (dw.getWorkoutId() == null) continue;
                if (uniqueWorkoutIds.contains(dw.getWorkoutId())) continue;
                Workout workout = workoutRepository.findById(dw.getWorkoutId()).orElse(null);
                if (workout != null) {
                    RecentWorkoutResponseDto dto = new RecentWorkoutResponseDto();
                    dto.setDiaryWorkoutId(dw.getDiaryWorkoutId());
                    dto.setWorkoutId(workout.getWorkoutId());
                    dto.setWorkoutName(workout.getWorkoutName());
                    dto.setTool(workout.getTool());
                    result.add(dto);
                    uniqueWorkoutIds.add(workout.getWorkoutId());
                    if (result.size() >= limit) return result;
                }
            }
        }
        return result;
    }
}