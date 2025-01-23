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
public class DiaryServiceImpl implements DiaryService {
    private final DiaryRepository diaryRepository;
    private final DiaryWorkoutRepository diaryWorkoutRepository;
    private final WorkoutSetRepository workoutSetRepository;

    public DiaryServiceImpl(DiaryRepository diaryRepository, DiaryWorkoutRepository diaryWorkoutRepository, WorkoutSetRepository workoutSetRepository) {
        this.diaryRepository = diaryRepository;
        this.diaryWorkoutRepository = diaryWorkoutRepository;
        this.workoutSetRepository = workoutSetRepository;
    }


    @Override
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

    @Override
    @Transactional
    public void addDiary(DiaryCreateDto diaryCreateDto) {
        Diary diary = new Diary();
        diary.setUserId(diaryCreateDto.getUserId());
        diary.setContent(diaryCreateDto.getContent());
        diary.setWorkoutDate(diaryCreateDto.getWorkoutDate());
        diary.setAllowedScope(diaryCreateDto.getAllowedScope());
        
        // 운동 다이어리 저장
        Diary savedDiary = diaryRepository.save(diary);

        // 운동 목록 저장
        List<DiaryWorkout> diaryWorkouts = createDiaryWorkouts(diaryCreateDto.getWorkouts(), savedDiary);
        List<DiaryWorkout> savedDiaryWorkouts = diaryWorkoutRepository.saveAll(diaryWorkouts);

        // 운동 세트 저장
        List<WorkoutSet> workoutSets = createWorkoutSets(diaryCreateDto.getWorkouts(), savedDiaryWorkouts);
        workoutSetRepository.saveAll(workoutSets);
    }

    /** 다이어리에 포함된 운동 목록 DB 저장 **/
    private List<DiaryWorkout> createDiaryWorkouts(List<DiaryWorkoutRequestDto> workouts, Diary diary) {
        List<DiaryWorkout> diaryWorkouts = new ArrayList<>();
        for (DiaryWorkoutRequestDto workoutRequestDto : workouts) {
            DiaryWorkout diaryWorkout = new DiaryWorkout();
            diaryWorkout.setDiaryId(diary.getDiaryId());
            diaryWorkout.setWorkoutId(workoutRequestDto.getWorkoutId());
            diaryWorkout.setSetSum(workoutRequestDto.getSetSum());
            diaryWorkouts.add(diaryWorkout);
        }
        return diaryWorkouts;
    }

    /** 운동 목록에 포함된 세트 DB 저장 **/
    private List<WorkoutSet> createWorkoutSets(List<DiaryWorkoutRequestDto> workouts, List<DiaryWorkout> savedDiaryWorkouts) {
        List<WorkoutSet> workoutSets = new ArrayList<>();
        int i = 0;
        for (DiaryWorkoutRequestDto workoutRequestDto : workouts) {
            for (WorkoutSetRequestDto setRequestDto : workoutRequestDto.getSets()) {
                WorkoutSet workoutSet = new WorkoutSet();
                workoutSet.setDiaryWorkoutId(savedDiaryWorkouts.get(i).getDiaryWorkoutId());
                workoutSet.setWeight(setRequestDto.getWeight());
                workoutSet.setRepetition(setRequestDto.getRepetition());
                workoutSet.setWorkoutTime(setRequestDto.getWorkoutTime());
                workoutSet.setOrdinal(setRequestDto.getOrdinal());
                workoutSets.add(workoutSet);
            }
            i++;
        }
        return workoutSets;
    }


}
