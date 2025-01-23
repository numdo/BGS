package com.ssafy.bgs.diary.service;

import com.ssafy.bgs.diary.dto.request.DiaryCreateDto;
import com.ssafy.bgs.diary.dto.request.DiaryWorkoutRequestDto;
import com.ssafy.bgs.diary.dto.request.WorkoutSetRequestDto;
import com.ssafy.bgs.diary.entity.Diary;
import com.ssafy.bgs.diary.entity.DiaryWorkout;
import com.ssafy.bgs.diary.entity.WorkoutSet;
import com.ssafy.bgs.diary.repository.DiaryRepository;
import com.ssafy.bgs.diary.repository.DiaryWorkoutRepository;
import com.ssafy.bgs.diary.repository.WorkoutSetRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

@Service
public class DiaryService {
    private final DiaryRepository diaryRepository;
    private final DiaryWorkoutRepository diaryWorkoutRepository;
    private final WorkoutSetRepository workoutSetRepository;

    public DiaryService(DiaryRepository diaryRepository, DiaryWorkoutRepository diaryWorkoutRepository, WorkoutSetRepository workoutSetRepository) {
        this.diaryRepository = diaryRepository;
        this.diaryWorkoutRepository = diaryWorkoutRepository;
        this.workoutSetRepository = workoutSetRepository;
    }

    public Page<Diary> getDiaryList(Integer userId, Date workoutDate, int page, int pageSize) {
        Pageable pageable = PageRequest.of(page - 1, pageSize);
        if (userId != null && workoutDate != null) {
            return diaryRepository.findByUserIdAndWorkoutDate(userId, workoutDate, pageable);
        } else if (userId != null) {
            return diaryRepository.findByUserId(userId, pageable);
        } else if (workoutDate != null) {
            return diaryRepository.findByWorkoutDate(workoutDate, pageable);
        } else {
            return diaryRepository.findAll(pageable);
        }
    }

    @Transactional
    public void addDiary(DiaryCreateDto diaryCreateDto) {
        // 운동 다이어리 column 입력
        Diary diary = new Diary();
        diary.setUserId(diaryCreateDto.getUserId());
        diary.setContent(diaryCreateDto.getContent());
        diary.setWorkoutDate(diaryCreateDto.getWorkoutDate());
        diary.setAllowedScope(diaryCreateDto.getAllowedScope());
        
        // 운동 다이어리 저장
        Diary savedDiary = diaryRepository.save(diary);

        // 운동 목록 저장
        List<DiaryWorkout> diaryWorkouts = addDiaryWorkouts(diaryCreateDto.getWorkouts(), savedDiary);
        List<DiaryWorkout> savedDiaryWorkouts = diaryWorkoutRepository.saveAll(diaryWorkouts);

        // 운동 세트 저장
        List<WorkoutSet> workoutSets = addWorkoutSets(diaryCreateDto.getWorkouts(), savedDiaryWorkouts);
        workoutSetRepository.saveAll(workoutSets);


    }

    /** DB에 추가할 운동 목록 리스트 반환 **/
    private List<DiaryWorkout> addDiaryWorkouts(List<DiaryWorkoutRequestDto> workouts, Diary diary) {
        List<DiaryWorkout> diaryWorkouts = new ArrayList<>();
        for (DiaryWorkoutRequestDto workoutRequestDto : workouts) {
            // DiaryWorkout column 입력
            DiaryWorkout diaryWorkout = new DiaryWorkout();
            diaryWorkout.setDiaryId(diary.getDiaryId());
            diaryWorkout.setWorkoutId(workoutRequestDto.getWorkoutId());
            diaryWorkout.setSetSum(workoutRequestDto.getSetSum());
            diaryWorkouts.add(diaryWorkout);
        }

        return diaryWorkouts;
    }

    /** DB에 추가할 운동 세트 리스트 반환 **/
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

    @Transactional
    public void updateDiary(DiaryCreateDto diaryCreateDto) {
        Diary existingDiary = diaryRepository.findById(diaryCreateDto.getDiaryId()).orElseThrow(() -> new IllegalArgumentException("Diary not found"));
        // Diary column 수정
        existingDiary.setWorkoutDate(diaryCreateDto.getWorkoutDate());
        existingDiary.setContent(diaryCreateDto.getContent());
        existingDiary.setAllowedScope(diaryCreateDto.getAllowedScope());

        // Diary update
        Diary savedDiary = diaryRepository.save(existingDiary);

        // DiaryWorkout update
        List<DiaryWorkout> diaryWorkouts = updateDiaryWorkouts(diaryCreateDto.getWorkouts(), savedDiary);
        List<DiaryWorkout> savedDiaryWorkouts = diaryWorkoutRepository.saveAll(diaryWorkouts);

        // WorkoutSet update
        List<WorkoutSet> workoutSets = updateWorkoutSets(diaryCreateDto.getWorkouts(), savedDiaryWorkouts);
        workoutSetRepository.saveAll(workoutSets);
    }

    /** DB에 업데이트할 운동 목록 리스트 반환 **/
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
                existingDiaryWorkout = diaryWorkoutRepository.findById(workoutRequestDto.getDiaryWorkoutId()).orElseThrow(() -> new IllegalArgumentException("Diary Workout not found"));
            }

            // DiaryWorkout column 수정
            existingDiaryWorkout.setWorkoutId(workoutRequestDto.getWorkoutId());
            existingDiaryWorkout.setSetSum(workoutRequestDto.getSetSum());
            existingDiaryWorkout.setDeleted(workoutRequestDto.getDeleted());

            // 리스트에 추가
            diaryWorkouts.add(existingDiaryWorkout);
        }

        return diaryWorkouts;
    }

    /** DB에 업데이트할 운동 세트 리스트 반환 **/
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
                    existingWorkoutSet = workoutSetRepository.findById(setRequestDto.getWorkoutSetId()).orElseThrow(() -> new IllegalArgumentException("Workout Set not found"));
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
}
