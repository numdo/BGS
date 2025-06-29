package com.ssafy.bgs.diary.repository;

import com.ssafy.bgs.diary.dto.response.DiaryFeedResponseDto;
import com.ssafy.bgs.diary.entity.Diary;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DiaryRepository extends JpaRepository<Diary, Integer> {

    List<Diary> findByUserIdAndWorkoutDateBetweenAndDeletedFalse(Integer userId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT new  com.ssafy.bgs.diary.dto.response.DiaryFeedResponseDto(d.diaryId, d.allowedScope, d.workoutDate) " +
            "FROM Diary d WHERE d.allowedScope = :allowedScope AND d.deleted = false " +
            "ORDER BY d.createdAt DESC ")
    List<DiaryFeedResponseDto> findByAllowedScopeAndDeletedFalse(String allowedScope, Pageable pageable);

    @Query("SELECT new  com.ssafy.bgs.diary.dto.response.DiaryFeedResponseDto(d.diaryId, d.allowedScope, d.workoutDate) " +
            "FROM Diary d " +
            "JOIN Hashtag h ON d.diaryId = h.id.diaryId " +
            "WHERE d.allowedScope = :allowedScope " +
            "AND d.deleted = false " +
            "AND h.id.tag LIKE CONCAT('%', :hashtag, '%' )" +
            "ORDER BY d.createdAt DESC ")
    List<DiaryFeedResponseDto> findByAllowedScopeAndDeletedFalse(String allowedScope, String hashtag, Pageable pageable);

    @Query("SELECT new com.ssafy.bgs.diary.dto.response.DiaryFeedResponseDto(d.diaryId, d.allowedScope, d.workoutDate) " +
            "FROM Diary d WHERE d.userId = :userId AND d.deleted = false " +
            "ORDER BY d.createdAt DESC ")
    List<DiaryFeedResponseDto> findByUserIdAndDeletedFalse(Integer userId, Pageable pageable);

    @Query("SELECT new com.ssafy.bgs.diary.dto.response.DiaryFeedResponseDto(d.diaryId, d.allowedScope, d.workoutDate) " +
            "FROM Diary d WHERE d.userId = :userId AND d.allowedScope = :allowedScope AND d.deleted = false " +
            "ORDER BY d.createdAt DESC ")
    List<DiaryFeedResponseDto> findByUserIdAndAllowedScopeAndDeletedFalse(Integer userId, String allowedScope, Pageable pageable);

    List<Diary> findByUserIdAndDeletedFalse(Integer userId);

    boolean existsByUserIdAndCreatedAtBetween(Integer userId, LocalDateTime startOfDay, LocalDateTime endOfDay);

    long countByUserIdAndDeletedFalse(Integer userId);

    Long countByUserIdAndAllowedScopeAndDeletedFalse(Integer userId, String allowedScope);
}
