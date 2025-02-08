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
import com.ssafy.bgs.user.entity.User;
import com.ssafy.bgs.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.*;

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


    public DiaryService(DiaryRepository diaryRepository, DiaryWorkoutRepository diaryWorkoutRepository, WorkoutSetRepository workoutSetRepository, DiaryLikedRepository diaryLikedRepository, HashtagRepository hashtagRepository, CommentRepository commentRepository, ImageService imageService, UserRepository userRepository, WorkoutRepository workoutRepository) {
        this.diaryRepository = diaryRepository;
        this.diaryWorkoutRepository = diaryWorkoutRepository;
        this.workoutSetRepository = workoutSetRepository;
        this.diaryLikedRepository = diaryLikedRepository;
        this.hashtagRepository = hashtagRepository;
        this.commentRepository = commentRepository;
        this.imageService = imageService;
        this.userRepository = userRepository;
        this.workoutRepository = workoutRepository;
    }

    /**
     * Feed select
     **/
    public List<DiaryFeedResponseDto> getFeedList(Integer readerId, Integer userId, int page, int pageSize) {
        Pageable pageable = PageRequest.of(page - 1, pageSize);
        List<DiaryFeedResponseDto> feedList;
        if (userId == null) {
            feedList = diaryRepository.findByAllowedScopeAndDeletedFalse("A", pageable);
        } else if (readerId.equals(userId)) {
            feedList = diaryRepository.findByUserIdAndDeletedFalse(userId, pageable);
        } else {
            feedList = diaryRepository.findByUserIdAndAllowedScopeAndDeletedFalse(userId, "A", pageable);
        }

        feedList.forEach(diary -> {
            // 이미지 조회
            ImageResponseDto image = imageService.getImage("diary", diary.getDiaryId());
            if (image != null) {
                diary.setImageUrl(imageService.getS3Url(image.getUrl()));
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
     **/
    @Transactional
    public void addDiary(DiaryRequestDto diaryRequestDto, List<MultipartFile> files) {
        // 운동 다이어리 column 입력
        Diary diary = new Diary();
        diary.setUserId(diaryRequestDto.getUserId());
        diary.setContent(diaryRequestDto.getContent());
        diary.setWorkoutDate(diaryRequestDto.getWorkoutDate());
        diary.setAllowedScope(diaryRequestDto.getAllowedScope());

        // 운동 다이어리 저장
        Diary savedDiary = diaryRepository.save(diary);

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
            imageService.uploadImages(files, "diary", Long.valueOf(savedDiary.getDiaryId()));
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

    /**
     * Diary 단건 조회
     **/
    public DiaryResponseDto getDiary(Integer viewerId, Integer diaryId) {
        DiaryResponseDto diaryResponseDto = new DiaryResponseDto();

        // 미존재
        Diary diary = diaryRepository.findById(diaryId).orElse(null);
        if (diary == null || diary.getDeleted()) {
            throw new DiaryNotFoundException(diaryId);
        }

        // Diary 조회
        diaryResponseDto.setDiaryId(diary.getDiaryId());
        diaryResponseDto.setUserId(diary.getUserId());
        diaryResponseDto.setWorkoutDate(diary.getWorkoutDate());
        diaryResponseDto.setContent(diary.getContent());
        diaryResponseDto.setAllowedScope(diary.getAllowedScope());
        diaryResponseDto.setCreatedAt(diary.getCreatedAt());
        diaryResponseDto.setModifiedAt(diary.getModifiedAt());

        // 작성자 조회
        User writer = userRepository.findById(diaryResponseDto.getUserId()).orElse(null);
        if (writer != null) {
            diaryResponseDto.setWriter(writer.getNickname());
            ImageResponseDto image = imageService.getImage("profile", writer.getId());
            if (image != null) {
                diaryResponseDto.setProfileImageUrl(imageService.getS3Url(image.getUrl()));
            }
        }

        // 좋아요 누른 여부 & 좋아요 수 조회
        DiaryLiked diaryLiked = diaryLikedRepository.findById(new DiaryLikedId(diaryId, viewerId)).orElse(null);
        diaryResponseDto.setIsLiked(diaryLiked == null ? false : true);
        diaryResponseDto.setLikedCount(diaryLikedRepository.countDiaryLikedByIdDiaryId(diaryId));

        // Hashtag 조회
        List<Hashtag> hashtags = hashtagRepository.findByIdDiaryId(diaryId);
        for (Hashtag hashtag : hashtags) {
            diaryResponseDto.getHashtags().add(hashtag.getId().getTag());
        }


        // Diary Workout 조회
        List<DiaryWorkout> diaryWorkouts = diaryWorkoutRepository.findByDiaryIdAndDeletedFalse(diaryId);
        for (DiaryWorkout diaryWorkout : diaryWorkouts) {
            DiaryWorkoutResponseDto diaryWorkoutResponseDto = new DiaryWorkoutResponseDto();
            diaryWorkoutResponseDto.setDiaryWorkoutId(diaryWorkout.getDiaryWorkoutId());
            diaryWorkoutResponseDto.setWorkoutId(diaryWorkout.getWorkoutId());
            diaryWorkoutResponseDto.setCreatedAt(diaryWorkout.getCreatedAt());
            diaryWorkoutResponseDto.setModifiedAt(diaryWorkout.getModifiedAt());

            // WorkoutSet 조회
            List<WorkoutSet> workoutSets = workoutSetRepository.findByDiaryWorkoutIdAndDeletedFalse(diaryWorkout.getDiaryWorkoutId());
            for (WorkoutSet workoutSet : workoutSets) {
                WorkoutSetResponseDto workoutSetResponseDto = new WorkoutSetResponseDto();
                workoutSetResponseDto.setWorkoutSetId(workoutSet.getWorkoutSetId());
                workoutSetResponseDto.setWeight(workoutSet.getWeight());
                workoutSetResponseDto.setRepetition(workoutSet.getRepetition());
                workoutSetResponseDto.setWorkoutTime(workoutSet.getWorkoutTime());
                workoutSetResponseDto.setCreatedAt(workoutSet.getCreatedAt());
                workoutSetResponseDto.setModifiedAt(workoutSet.getModifiedAt());

                // workoutSets 리스트에 추가
                diaryWorkoutResponseDto.getSets().add(workoutSetResponseDto);
            }

            // diaryWorkouts 리스트에 추가
            diaryResponseDto.getDiaryWorkouts().add(diaryWorkoutResponseDto);
        }

        // Image 조회
        List<Image> images = imageService.getImages("diary", diaryId);
        for (Image image : images) {
            ImageResponseDto imageResponseDto = new ImageResponseDto();
            imageResponseDto.setImageId(image.getImageId());
            imageResponseDto.setUrl(imageService.getS3Url(image.getUrl()));
            imageResponseDto.setExtension(image.getExtension());

            // images 리스트에 추가
            diaryResponseDto.getImages().add(imageResponseDto);
        }

        return diaryResponseDto;
    }

    /**
     * Diary update
     **/
    @Transactional
    public void updateDiary(Integer userId, DiaryRequestDto diaryRequestDto, List<String> urls, List<MultipartFile> files) {
        // 다이어리 미존재
        Diary existingDiary = diaryRepository.findById(diaryRequestDto.getDiaryId()).orElse(null);
        if (existingDiary == null || existingDiary.getDeleted()) {
            throw new DiaryNotFoundException(diaryRequestDto.getDiaryId());
        }

        // 다이어리 수정 권한 없음
        if (!existingDiary.getUserId().equals(userId))
            throw new UnauthorizedAccessException("다이어리 수정 권한 없음") {
            };

        // Diary column 수정
        existingDiary.setWorkoutDate(diaryRequestDto.getWorkoutDate());
        existingDiary.setContent(diaryRequestDto.getContent());
        existingDiary.setAllowedScope(diaryRequestDto.getAllowedScope());

        // Diary update
        Diary savedDiary = diaryRepository.save(existingDiary);

        // Hashtag update
        hashtagRepository.deleteAllByIdDiaryId(savedDiary.getDiaryId());
        saveHashtags(diaryRequestDto.getHashtags(), savedDiary.getDiaryId());

        // DiaryWorkout update
        List<DiaryWorkout> diaryWorkouts = updateDiaryWorkouts(diaryRequestDto.getDiaryWorkouts(), savedDiary);
        List<DiaryWorkout> savedDiaryWorkouts = diaryWorkoutRepository.saveAll(diaryWorkouts);

        // WorkoutSet update
        List<WorkoutSet> workoutSets = updateWorkoutSets(diaryRequestDto.getDiaryWorkouts(), savedDiaryWorkouts);
        workoutSetRepository.saveAll(workoutSets);

        // unused image delete
        List<Image> existingImages = imageService.getImages("diary", existingDiary.getDiaryId());
        for (Image image : existingImages) {
            if (urls == null || !urls.contains(imageService.getS3Url(image.getUrl()))) {
                imageService.deleteImage(image.getImageId());
            }
        }

        // new image insert
        if (files != null && !files.isEmpty()) {
            imageService.uploadImages(files, "diary", Long.valueOf(existingDiary.getDiaryId()));
        }
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
            // DiaryWorkout 삭제되면 패스
            if (workoutRequestDto.getDeleted())
                continue;

            for (WorkoutSetRequestDto setRequestDto : workoutRequestDto.getSets()) {
                WorkoutSet existingWorkoutSet;
                // 새로운 운동 세트
                if (setRequestDto.getWorkoutSetId() == null) {
                    existingWorkoutSet = new WorkoutSet();
                    existingWorkoutSet.setDiaryWorkoutId(savedDiaryWorkouts.get(i).getDiaryWorkoutId());
                }
                // 기존 운동 세트
                else {
                    existingWorkoutSet = workoutSetRepository.findById(setRequestDto.getWorkoutSetId()).orElseThrow(() -> new WorkoutSetNotFoundException(setRequestDto.getWorkoutSetId()));
                }

                // WorkoutSet column 수정
                existingWorkoutSet.setDiaryWorkoutId(savedDiaryWorkouts.get(i).getDiaryWorkoutId());
                existingWorkoutSet.setWeight(setRequestDto.getWeight());
                existingWorkoutSet.setRepetition(setRequestDto.getRepetition());
                existingWorkoutSet.setWorkoutTime(setRequestDto.getWorkoutTime());
                existingWorkoutSet.setDeleted(setRequestDto.getDeleted());

                // 리스트에 추가
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
    public Page<CommentResponseDto> getCommentList(Integer diaryId, int page, int pageSize) {
        Pageable pageable = PageRequest.of(page - 1, pageSize);
        return commentRepository.findCommentsByDiaryId(diaryId, pageable);
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