package com.ssafy.bgs.routine.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.bgs.ai.service.GPTService;
import com.ssafy.bgs.common.UnauthorizedAccessException;
import com.ssafy.bgs.image.dto.response.ImageResponseDto;
import com.ssafy.bgs.image.entity.Image;
import com.ssafy.bgs.image.service.ImageService;
import com.ssafy.bgs.routine.dto.request.RoutineRequestDto;
import com.ssafy.bgs.routine.dto.request.RoutineWorkoutRequestDto;
import com.ssafy.bgs.routine.dto.request.RoutineWorkoutSetRequestDto;
import com.ssafy.bgs.routine.dto.response.PreviousWorkoutResponseDto;
import com.ssafy.bgs.routine.dto.response.RecentWorkoutResponseDto;
import com.ssafy.bgs.routine.dto.response.RoutineResponseDto;
import com.ssafy.bgs.routine.dto.response.RoutineWorkoutResponseDto;
import com.ssafy.bgs.routine.dto.response.RoutineWorkoutSetResponseDto;
import com.ssafy.bgs.routine.entity.Routine;
import com.ssafy.bgs.routine.entity.RoutineWorkout;
import com.ssafy.bgs.routine.entity.RoutineWorkoutSet;
import com.ssafy.bgs.routine.exception.RoutineNotFoundException;
import com.ssafy.bgs.routine.exception.RoutineWorkoutNotFoundException;
import com.ssafy.bgs.routine.exception.RoutineWorkoutSetNotFoundException;
import com.ssafy.bgs.routine.repository.RoutineRepository;
import com.ssafy.bgs.routine.repository.RoutineWorkoutRepository;
import com.ssafy.bgs.routine.repository.RoutineWorkoutSetRepository;
import com.ssafy.bgs.user.entity.User;
import com.ssafy.bgs.user.repository.UserRepository;
import com.ssafy.bgs.diary.entity.Workout;
import com.ssafy.bgs.diary.repository.WorkoutRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RoutineService {

    private final RoutineRepository routineRepository;
    private final RoutineWorkoutRepository routineWorkoutRepository;
    private final RoutineWorkoutSetRepository routineWorkoutSetRepository;
    private final ImageService imageService;
    private final UserRepository userRepository;
    private final WorkoutRepository workoutRepository;
    private final GPTService gptService; // GPT API 호출을 위한 서비스

    /**
     * Routine 목록 조회
     * (예: 해당 유저가 등록한 Routine을 생성일 기준으로 조회 – 필요에 따라 workoutDate 등 별도 날짜 컬럼 사용)
     */
    public List<Routine> getRoutineList(Integer userId, int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        return routineRepository.findByUserIdAndCreatedAtBetweenAndDeletedFalse(
                userId, startDate.atStartOfDay(), endDate.atTime(23, 59, 59));
    }

    /**
     * Routine 등록
     * - Routine(메인), RoutineWorkout(일별 운동 내역), RoutineWorkoutSet(세트) 등록
     * - 이미지 파일 업로드 처리
     */
    @Transactional
    public void addRoutine(RoutineRequestDto routineRequestDto, List<MultipartFile> files) {
        // Routine 생성
        Routine routine = new Routine();
        routine.setUserId(routineRequestDto.getUserId());
        routine.setRoutineName(routineRequestDto.getRoutineName());
        routine.setCreatedAt(LocalDateTime.now());
        routine.setModifiedAt(LocalDateTime.now());
        routine.setDeleted(false);
        Routine savedRoutine = routineRepository.save(routine);

        // RoutineWorkout 목록 생성 및 저장
        List<RoutineWorkout> routineWorkouts = addRoutineWorkouts(routineRequestDto.getRoutineWorkouts(), savedRoutine);
        List<RoutineWorkout> savedRoutineWorkouts = routineWorkoutRepository.saveAll(routineWorkouts);

        // RoutineWorkoutSet 목록 생성 및 저장
        List<RoutineWorkoutSet> routineWorkoutSets = addRoutineWorkoutSets(routineRequestDto.getRoutineWorkouts(), savedRoutineWorkouts);
        routineWorkoutSetRepository.saveAll(routineWorkoutSets);

        // 이미지 업로드 처리
        if (files != null && !files.isEmpty()) {
            imageService.uploadImages(files, "routine", Long.valueOf(savedRoutine.getRoutineId()));
        }
    }

    // DB에 추가할 RoutineWorkout 목록 생성 (외래키는 단순 숫자형으로 설정)
    private List<RoutineWorkout> addRoutineWorkouts(List<RoutineWorkoutRequestDto> workouts, Routine routine) {
        List<RoutineWorkout> routineWorkouts = new ArrayList<>();
        for (RoutineWorkoutRequestDto workoutDto : workouts) {
            RoutineWorkout routineWorkout = new RoutineWorkout();
            // 외래키를 객체 대신 Routine의 ID를 설정
            routineWorkout.setRoutineId(routine.getRoutineId());
            if (workoutDto.getWorkoutId() != null) {
                routineWorkout.setWorkoutId(workoutDto.getWorkoutId().shortValue());
            }
            routineWorkout.setRoutineWorkoutDay(workoutDto.getRoutineWorkoutDay());
            routineWorkout.setRoutineWorkoutOrder(workoutDto.getRoutineWorkoutOrder());
            routineWorkout.setCreatedAt(LocalDateTime.now());
            routineWorkout.setModifiedAt(LocalDateTime.now());
            routineWorkout.setDeleted(false);
            routineWorkouts.add(routineWorkout);
        }
        return routineWorkouts;
    }

    // DB에 추가할 RoutineWorkoutSet 목록 생성 (외래키는 단순 숫자형으로 설정)
    private List<RoutineWorkoutSet> addRoutineWorkoutSets(List<RoutineWorkoutRequestDto> workouts, List<RoutineWorkout> savedRoutineWorkouts) {
        List<RoutineWorkoutSet> routineWorkoutSets = new ArrayList<>();
        int i = 0;
        for (RoutineWorkoutRequestDto workoutDto : workouts) {
            for (RoutineWorkoutSetRequestDto setDto : workoutDto.getSets()) {
                RoutineWorkoutSet workoutSet = new RoutineWorkoutSet();
                // 외래키로 RoutineWorkout의 ID 설정
                workoutSet.setRoutineWorkoutId(savedRoutineWorkouts.get(i).getRoutineWorkoutId());
                workoutSet.setWorkoutId(Integer.valueOf(savedRoutineWorkouts.get(i).getWorkoutId()));
                workoutSet.setWeight(setDto.getWeight());
                workoutSet.setRepetition(setDto.getRepetition());
                workoutSet.setWorkoutTime(setDto.getWorkoutTime());
                workoutSet.setCreatedAt(LocalDateTime.now());
                workoutSet.setModifiedAt(LocalDateTime.now());
                workoutSet.setDeleted(false);
                routineWorkoutSets.add(workoutSet);
            }
            i++;
        }
        return routineWorkoutSets;
    }

    /**
     * Routine 단건 조회
     * - Routine, 하위 RoutineWorkout, RoutineWorkoutSet, 이미지, 작성자 정보 조회
     */
    public RoutineResponseDto getRoutine(Integer viewerId, Integer routineId) {
        RoutineResponseDto routineResponseDto = new RoutineResponseDto();

        Routine routine = routineRepository.findById(routineId).orElse(null);
        if (routine == null || Boolean.TRUE.equals(routine.getDeleted())) {
            throw new RoutineNotFoundException(routineId);
        }

        routineResponseDto.setRoutineId(routine.getRoutineId());
        routineResponseDto.setUserId(routine.getUserId());
        routineResponseDto.setRoutineName(routine.getRoutineName());
        routineResponseDto.setCreatedAt(routine.getCreatedAt());
        routineResponseDto.setModifiedAt(routine.getModifiedAt());

        // 작성자 정보 조회
        User writer = userRepository.findById(routine.getUserId()).orElse(null);
        if (writer != null) {
            routineResponseDto.setWriter(writer.getNickname());
            ImageResponseDto profileImage = imageService.getImage("profile", writer.getId());
            if (profileImage != null) {
                routineResponseDto.setProfileImageUrl(imageService.getS3Url(profileImage.getUrl()));
            }
        }

        // RoutineWorkout 및 하위 RoutineWorkoutSet 조회 (외래키를 단순 값으로 관리)
        List<RoutineWorkout> routineWorkouts = routineWorkoutRepository.findByRoutineIdAndDeletedFalse(routineId);
        for (RoutineWorkout rw : routineWorkouts) {
            RoutineWorkoutResponseDto workoutResponseDto = new RoutineWorkoutResponseDto();
            workoutResponseDto.setRoutineWorkoutId(rw.getRoutineWorkoutId());
            if (rw.getWorkoutId() != null) {
                workoutResponseDto.setWorkoutId(rw.getWorkoutId().intValue());
            }
            workoutResponseDto.setRoutineWorkoutDay(rw.getRoutineWorkoutDay());
            workoutResponseDto.setRoutineWorkoutOrder(rw.getRoutineWorkoutOrder());
            workoutResponseDto.setCreatedAt(rw.getCreatedAt());
            workoutResponseDto.setModifiedAt(rw.getModifiedAt());

            List<RoutineWorkoutSet> sets = routineWorkoutSetRepository.findByRoutineWorkoutIdAndDeletedFalse(rw.getRoutineWorkoutId());
            for (RoutineWorkoutSet set : sets) {
                RoutineWorkoutSetResponseDto setResponseDto = new RoutineWorkoutSetResponseDto();
                setResponseDto.setWorkoutSetId(set.getWorkoutSetId());
                setResponseDto.setWeight(set.getWeight());
                setResponseDto.setRepetition(set.getRepetition());
                setResponseDto.setWorkoutTime(set.getWorkoutTime());
                setResponseDto.setWorkoutId(set.getWorkoutId());
                setResponseDto.setCreatedAt(set.getCreatedAt());
                setResponseDto.setModifiedAt(set.getModifiedAt());
                workoutResponseDto.getSets().add(setResponseDto);
            }
            routineResponseDto.getRoutineWorkouts().add(workoutResponseDto);
        }

        ImageResponseDto routineImage = imageService.getImage("routine", routineId);
        if (routineImage != null) {
            String routineImageUrl = imageService.getS3Url(routineImage.getUrl());
            routineResponseDto.setRoutineImageUrl(routineImageUrl);
        }
        return routineResponseDto;
    }

    /**
     * Routine 수정
     */
    @Transactional
    public void updateRoutine(Integer userId, RoutineRequestDto routineRequestDto, List<String> urls, List<MultipartFile> files) {
        Routine existingRoutine = routineRepository.findById(routineRequestDto.getRoutineId()).orElse(null);
        if (existingRoutine == null || Boolean.TRUE.equals(existingRoutine.getDeleted())) {
            throw new RoutineNotFoundException(routineRequestDto.getRoutineId());
        }
        if (!existingRoutine.getUserId().equals(userId))
            throw new UnauthorizedAccessException("Routine 수정 권한이 없습니다.");

        existingRoutine.setRoutineName(routineRequestDto.getRoutineName());
        existingRoutine.setModifiedAt(LocalDateTime.now());
        Routine savedRoutine = routineRepository.save(existingRoutine);

        List<RoutineWorkout> routineWorkouts = updateRoutineWorkouts(routineRequestDto.getRoutineWorkouts(), savedRoutine);
        List<RoutineWorkout> savedRoutineWorkouts = routineWorkoutRepository.saveAll(routineWorkouts);

        List<RoutineWorkoutSet> routineWorkoutSets = updateRoutineWorkoutSets(routineRequestDto.getRoutineWorkouts(), savedRoutineWorkouts);
        routineWorkoutSetRepository.saveAll(routineWorkoutSets);
        // 이미지 관련 처리는 컨트롤러에서 별도로 처리
    }

    private List<RoutineWorkout> updateRoutineWorkouts(List<RoutineWorkoutRequestDto> workouts, Routine savedRoutine) {
        List<RoutineWorkout> routineWorkouts = new ArrayList<>();
        for (RoutineWorkoutRequestDto workoutDto : workouts) {
            RoutineWorkout existingRoutineWorkout;
            if (workoutDto.getRoutineWorkoutId() == null) {
                existingRoutineWorkout = new RoutineWorkout();
                existingRoutineWorkout.setRoutineId(savedRoutine.getRoutineId());
                existingRoutineWorkout.setCreatedAt(LocalDateTime.now());
            } else {
                existingRoutineWorkout = routineWorkoutRepository.findById(workoutDto.getRoutineWorkoutId())
                        .orElseThrow(() -> new RoutineWorkoutNotFoundException(workoutDto.getRoutineWorkoutId()));
            }
            if (workoutDto.getWorkoutId() != null) {
                existingRoutineWorkout.setWorkoutId(workoutDto.getWorkoutId().shortValue());
            }

            existingRoutineWorkout.setRoutineWorkoutDay(workoutDto.getRoutineWorkoutDay());
            existingRoutineWorkout.setRoutineWorkoutOrder(workoutDto.getRoutineWorkoutOrder());
            existingRoutineWorkout.setModifiedAt(LocalDateTime.now());
            existingRoutineWorkout.setDeleted(workoutDto.getDeleted());
            routineWorkouts.add(existingRoutineWorkout);
        }
        return routineWorkouts;
    }

    private List<RoutineWorkoutSet> updateRoutineWorkoutSets(List<RoutineWorkoutRequestDto> workouts, List<RoutineWorkout> savedRoutineWorkouts) {
        List<RoutineWorkoutSet> routineWorkoutSets = new ArrayList<>();
        int i = 0;
        for (RoutineWorkoutRequestDto workoutDto : workouts) {
            if (Boolean.TRUE.equals(workoutDto.getDeleted()))
                continue;
            for (RoutineWorkoutSetRequestDto setDto : workoutDto.getSets()) {
                RoutineWorkoutSet existingSet;
                if (setDto.getWorkoutSetId() == null) {
                    existingSet = new RoutineWorkoutSet();
                    existingSet.setWorkoutId(Integer.valueOf(savedRoutineWorkouts.get(i).getWorkoutId()));
                    existingSet.setRoutineWorkoutId(savedRoutineWorkouts.get(i).getRoutineWorkoutId());
                    existingSet.setCreatedAt(LocalDateTime.now());
                } else {
                    existingSet = routineWorkoutSetRepository.findById(setDto.getWorkoutSetId())
                            .orElseThrow(() -> new RoutineWorkoutSetNotFoundException(setDto.getWorkoutSetId()));
                }
                existingSet.setRoutineWorkoutId(savedRoutineWorkouts.get(i).getRoutineWorkoutId());
                existingSet.setWorkoutId(Integer.valueOf(savedRoutineWorkouts.get(i).getWorkoutId()));
                existingSet.setWeight(setDto.getWeight());
                existingSet.setRepetition(setDto.getRepetition());
                existingSet.setWorkoutTime(setDto.getWorkoutTime());
                existingSet.setModifiedAt(LocalDateTime.now());
                existingSet.setDeleted(setDto.getDeleted());
                routineWorkoutSets.add(existingSet);
            }
            i++;
        }
        return routineWorkoutSets;
    }

    /**
     * Routine 삭제 (soft delete) 및 이미지 삭제 처리
     */
    public void deleteRoutine(Integer userId, Integer routineId) {
        Routine routine = routineRepository.findById(routineId).orElse(null);
        if (routine == null || Boolean.TRUE.equals(routine.getDeleted())) {
            throw new RoutineNotFoundException(routineId);
        }
        if (!routine.getUserId().equals(userId))
            throw new UnauthorizedAccessException("Routine 삭제 권한이 없습니다.");
        routine.setDeleted(true);
        routineRepository.save(routine);
        List<Image> images = imageService.getImages("routine", routineId);
        for (Image image : images) {
            imageService.deleteImage(image.getImageId());
        }
    }

    // 운동 관련 기능 (모든 운동 조회, 검색)
    public List<Workout> getAllWorkouts() {
        return workoutRepository.findAll();
    }

    public List<Workout> searchWorkouts(String keyword) {
        return workoutRepository.findByWorkoutNameContainingIgnoreCase(keyword);
    }

    /**
     * 이전 운동 기록 조회
     * - 사용자가 작성한 Routine과 해당 RoutineWorkout, RoutineWorkoutSet의 정보를 모아 반환
     */
    public List<PreviousWorkoutResponseDto> getPreviousWorkoutRecords(Integer userId, int limit) {
        List<Routine> routines = routineRepository.findByUserIdAndDeletedFalse(userId);
        routines.sort((r1, r2) -> {
            int cmp = r2.getCreatedAt().compareTo(r1.getCreatedAt());
            if (cmp == 0) {
                cmp = r2.getRoutineId().compareTo(r1.getRoutineId());
            }
            return cmp;
        });
        List<PreviousWorkoutResponseDto> result = new ArrayList<>();
        for (Routine routine : routines) {
            List<RoutineWorkout> rwList = routineWorkoutRepository.findByRoutineIdAndDeletedFalse(routine.getRoutineId());
            if (rwList.isEmpty()) continue;
            PreviousWorkoutResponseDto dto = new PreviousWorkoutResponseDto();
            dto.setRoutineId(routine.getRoutineId());
            dto.setRoutineWorkoutId(rwList.get(0).getRoutineWorkoutId());
            dto.setRoutineDate(java.sql.Date.valueOf(routine.getCreatedAt().toLocalDate()));
            List<Integer> workoutIds = new ArrayList<>();
            List<String> workoutNames = new ArrayList<>();
            List<String> workoutParts = new ArrayList<>();
            List<String> workoutTools = new ArrayList<>();
            List<RoutineWorkoutSetResponseDto> allSets = new ArrayList<>();
            for (RoutineWorkout rw : rwList) {
                Workout workout = workoutRepository.findById(rw.getWorkoutId().intValue()).orElse(null);
                if (workout == null) continue;
                workoutIds.add(workout.getWorkoutId());
                workoutNames.add(workout.getWorkoutName());
                workoutParts.add(workout.getPart());
                workoutTools.add(workout.getTool());
                List<RoutineWorkoutSet> sets = routineWorkoutSetRepository.findByRoutineWorkoutIdAndDeletedFalse(rw.getRoutineWorkoutId());
                for (RoutineWorkoutSet set : sets) {
                    RoutineWorkoutSetResponseDto setDto = new RoutineWorkoutSetResponseDto();
                    setDto.setWorkoutSetId(set.getWorkoutSetId());
                    setDto.setWorkoutId(rw.getWorkoutId().intValue());
                    setDto.setWeight(set.getWeight());
                    setDto.setRepetition(set.getRepetition());
                    setDto.setWorkoutTime(set.getWorkoutTime());
                    setDto.setCreatedAt(set.getCreatedAt());
                    setDto.setModifiedAt(set.getModifiedAt());
                    allSets.add(setDto);
                }
            }
            dto.setWorkoutIds(workoutIds);
            dto.setWorkoutName(String.join(", ", workoutNames));
            dto.setPart(String.join(", ", workoutParts));
            dto.setTool(String.join(", ", workoutTools));
            dto.setSets(allSets);
            dto.setWeight(null);
            dto.setRepetition(null);
            dto.setWorkoutTime(null);
            result.add(dto);
            if (result.size() >= limit) break;
        }
        return result;
    }

    /**
     * 최근 운동 기록 조회
     * - 중복 운동 제거 후, 가장 최근에 등록한 RoutineWorkout 기준으로 반환
     */
    public List<RecentWorkoutResponseDto> getRecentWorkouts(Integer userId, int limit) {
        List<Routine> routines = routineRepository.findByUserIdAndDeletedFalse(userId);
        routines.sort((r1, r2) -> {
            if (r1.getCreatedAt() == null && r2.getCreatedAt() == null) return 0;
            if (r1.getCreatedAt() == null) return 1;
            if (r2.getCreatedAt() == null) return -1;
            return r2.getCreatedAt().compareTo(r1.getCreatedAt());
        });
        List<RecentWorkoutResponseDto> result = new ArrayList<>();
        Set<Integer> uniqueWorkoutIds = new HashSet<>();
        for (Routine routine : routines) {
            List<RoutineWorkout> routineWorkouts = routineWorkoutRepository.findByRoutineIdAndDeletedFalse(routine.getRoutineId());
            routineWorkouts.sort((w1, w2) -> w2.getCreatedAt().compareTo(w1.getCreatedAt()));
            for (RoutineWorkout rw : routineWorkouts) {
                if (rw.getWorkoutId() == null) continue;
                if (uniqueWorkoutIds.contains(rw.getWorkoutId().intValue())) continue;
                Workout workout = workoutRepository.findById(rw.getWorkoutId().intValue()).orElse(null);
                if (workout != null) {
                    RecentWorkoutResponseDto dto = new RecentWorkoutResponseDto();
                    dto.setRoutineWorkoutId(rw.getRoutineWorkoutId());
                    dto.setWorkoutId(workout.getWorkoutId());
                    dto.setWorkoutName(workout.getWorkoutName());
                    dto.setTool(workout.getTool());
                    result.add(dto);
                    uniqueWorkoutIds.add(rw.getWorkoutId().intValue());
                    if (result.size() >= limit) return result;
                }
            }
        }
        return result;
    }

    // 새로운 기능 1: 최근 루틴 기록 조회
    public List<Routine> getRecentRoutines(Integer userId, int limit) {
        List<Routine> routines = routineRepository.findByUserIdAndDeletedFalse(userId);
        routines.sort((r1, r2) -> r2.getCreatedAt().compareTo(r1.getCreatedAt()));
        if (routines.size() > limit) {
            return routines.subList(0, limit);
        }
        return routines;
    }

    // 새로운 기능 2: 추천 운동 세트 생성
    // 사용자의 기존 루틴/운동 데이터를 집계하여 추천 운동 세트를 생성하고 루틴에 저장
    public RoutineResponseDto createRecommendedRoutine(Integer userId) {
        // 사용자 루틴들(삭제되지 않은)을 조회
        List<Routine> userRoutines = routineRepository.findByUserIdAndDeletedFalse(userId);
        List<RoutineWorkout> allWorkouts = new ArrayList<>();
        for (Routine r : userRoutines) {
            List<RoutineWorkout> rws = routineWorkoutRepository.findByRoutineIdAndDeletedFalse(r.getRoutineId());
            if (rws != null) {
                allWorkouts.addAll(rws);
            }
        }
        // 그룹화: workoutId별로 그룹화 (Short)
        Map<Short, List<RoutineWorkout>> groupedWorkouts = allWorkouts.stream()
                .filter(rw -> rw.getWorkoutId() != null)
                .collect(Collectors.groupingBy(RoutineWorkout::getWorkoutId));
        // 추천 루틴 생성
        Routine recommendedRoutine = new Routine();
        recommendedRoutine.setUserId(userId);
        recommendedRoutine.setRoutineName("추천 운동 세트 " + LocalDateTime.now());
        recommendedRoutine.setCreatedAt(LocalDateTime.now());
        recommendedRoutine.setModifiedAt(LocalDateTime.now());
        recommendedRoutine.setDeleted(false);
        Routine savedRoutine = routineRepository.save(recommendedRoutine);

        // 그룹별 집계하여 추천 루틴에 추가할 운동 기록 생성
        for (Map.Entry<Short, List<RoutineWorkout>> entry : groupedWorkouts.entrySet()) {
            Short workoutId = entry.getKey();
            List<RoutineWorkout> workoutGroup = entry.getValue();
            // 모든 해당 그룹의 세트들을 집계
            List<RoutineWorkoutSet> allSets = new ArrayList<>();
            for (RoutineWorkout rw : workoutGroup) {
                List<RoutineWorkoutSet> sets = routineWorkoutSetRepository.findByRoutineWorkoutIdAndDeletedFalse(rw.getRoutineWorkoutId());
                if (sets != null) {
                    allSets.addAll(sets);
                }
            }
            if (allSets.isEmpty()) {
                continue;
            }
            // 평균 계산
            double avgWeight = allSets.stream()
                    .filter(s -> s.getWeight() != null)
                    .mapToDouble(s -> s.getWeight().doubleValue())
                    .average().orElse(0);
            double avgRepetition = allSets.stream()
                    .filter(s -> s.getRepetition() != null)
                    .mapToInt(s -> s.getRepetition())
                    .average().orElse(0);
            double avgWorkoutTime = allSets.stream()
                    .filter(s -> s.getWorkoutTime() != null)
                    .mapToInt(s -> s.getWorkoutTime())
                    .average().orElse(0);

            // 새로운 RoutineWorkout 생성 (예: 모두 Day 1로 처리)
            RoutineWorkout newWorkout = new RoutineWorkout();
            newWorkout.setRoutineId(savedRoutine.getRoutineId());
            newWorkout.setWorkoutId(workoutId);
            newWorkout.setRoutineWorkoutDay(1);
            newWorkout.setRoutineWorkoutOrder(1); // 필요시 순서 조정
            newWorkout.setCreatedAt(LocalDateTime.now());
            newWorkout.setModifiedAt(LocalDateTime.now());
            newWorkout.setDeleted(false);
            RoutineWorkout savedWorkout = routineWorkoutRepository.save(newWorkout);

            // 새로운 RoutineWorkoutSet 생성 (하나의 세트로 집계)
            RoutineWorkoutSet newSet = new RoutineWorkoutSet();
            newSet.setRoutineWorkoutId(savedWorkout.getRoutineWorkoutId());
            newSet.setWorkoutId(Integer.valueOf(workoutId)); // Short -> Integer
            newSet.setWeight(new BigDecimal(avgWeight));
            newSet.setRepetition((int) Math.round(avgRepetition));
            newSet.setWorkoutTime((int) Math.round(avgWorkoutTime));
            newSet.setCreatedAt(LocalDateTime.now());
            newSet.setModifiedAt(LocalDateTime.now());
            newSet.setDeleted(false);
            routineWorkoutSetRepository.save(newSet);
        }
        // 추천 루틴 생성 후, 전체 세부 정보를 조회하여 반환
        return getRoutine(userId, savedRoutine.getRoutineId());
    }
    // =========================================================
    // 새로운 기능 3: 추천 운동 세트 생성 (GPT 기반 추천)
    public RoutineResponseDto createRecommendedRoutineFromGPT(Integer userId) {
        // 1. 사용자 루틴 데이터 집계: 기존 기록을 텍스트로 연결
        List<Routine> userRoutines = routineRepository.findByUserIdAndDeletedFalse(userId);
        StringBuilder sb = new StringBuilder();
        for (Routine r : userRoutines) {
            List<RoutineWorkout> rws = routineWorkoutRepository.findByRoutineIdAndDeletedFalse(r.getRoutineId());
            if (rws != null) {
                for (RoutineWorkout rw : rws) {
                    // Workout 이름 조회 (Workout 엔티티 사용)
                    Workout workout = workoutRepository.findById(rw.getWorkoutId().intValue()).orElse(null);
                    if (workout != null) {
                        sb.append(String.format("%s: Day %d, Order %d; ",
                                workout.getWorkoutName(), rw.getRoutineWorkoutDay(), rw.getRoutineWorkoutOrder()));
                    }
                }
            }
        }
        String aggregatedData = sb.toString();

        // 2. GPT 프롬프트 구성 (예시)
        String prompt = String.format(
                "사용자의 운동 기록: %s\n" +
                        "이 기록을 바탕으로 추천할 운동 세트를 JSON 형식으로 작성해주세요. " +
                        "예시 JSON: {\"workoutName\": \"벤치프레스\", \"sets\": [{\"weight\": 60, \"reps\": 5, \"workoutTime\": 60}]}",
                aggregatedData);
        String gptResponse = gptService.analyzeWorkout(prompt);

        // 3. GPT 응답 파싱
        ObjectMapper objectMapper = new ObjectMapper();
        String recommendedWorkoutName;
        int recommendedWeight;
        int recommendedReps;
        int recommendedWorkoutTime;
        try {
            JsonNode root = objectMapper.readTree(gptResponse);
            recommendedWorkoutName = root.get("workoutName").asText();
            JsonNode sets = root.get("sets");
            if (sets.isArray() && sets.size() > 0) {
                JsonNode firstSet = sets.get(0);
                recommendedWeight = firstSet.get("weight").asInt();
                recommendedReps = firstSet.get("reps").asInt();
                recommendedWorkoutTime = firstSet.get("workoutTime").asInt();
            } else {
                throw new IllegalArgumentException("추천 운동 세트 정보가 올바르지 않습니다.");
            }
        } catch (Exception e) {
            throw new RuntimeException("GPT 응답 파싱 실패: " + e.getMessage(), e);
        }

        // 4. 추천 루틴 생성
        Routine recommendedRoutine = new Routine();
        recommendedRoutine.setUserId(userId);
        recommendedRoutine.setRoutineName("추천 운동 세트 " + LocalDateTime.now());
        recommendedRoutine.setCreatedAt(LocalDateTime.now());
        recommendedRoutine.setModifiedAt(LocalDateTime.now());
        recommendedRoutine.setDeleted(false);
        Routine savedRoutine = routineRepository.save(recommendedRoutine);

        // 5. 추천 운동에 대해 RoutineWorkout 생성
        RoutineWorkout newWorkout = new RoutineWorkout();
        newWorkout.setRoutineId(savedRoutine.getRoutineId());
        newWorkout.setWorkoutId(workoutRepository.findByWorkoutNameContainingIgnoreCase(recommendedWorkoutName)
                .stream().findFirst().map(w -> w.getWorkoutId().shortValue()).orElse(null));
        newWorkout.setRoutineWorkoutDay(1);
        newWorkout.setRoutineWorkoutOrder(1);
        newWorkout.setCreatedAt(LocalDateTime.now());
        newWorkout.setModifiedAt(LocalDateTime.now());
        newWorkout.setDeleted(false);
        RoutineWorkout savedWorkout = routineWorkoutRepository.save(newWorkout);

        // 6. 추천 운동 세트 (하나의 세트로 집계) 생성
        RoutineWorkoutSet newSet = new RoutineWorkoutSet();
        newSet.setRoutineWorkoutId(savedWorkout.getRoutineWorkoutId());
        if (savedWorkout.getWorkoutId() != null) {
            newSet.setWorkoutId(Integer.valueOf(savedWorkout.getWorkoutId()));
        }
        newSet.setWeight(new BigDecimal(recommendedWeight));
        newSet.setRepetition(recommendedReps);
        newSet.setWorkoutTime(recommendedWorkoutTime);
        newSet.setCreatedAt(LocalDateTime.now());
        newSet.setModifiedAt(LocalDateTime.now());
        newSet.setDeleted(false);
        routineWorkoutSetRepository.save(newSet);

        return getRoutine(userId, savedRoutine.getRoutineId());
    }
}
