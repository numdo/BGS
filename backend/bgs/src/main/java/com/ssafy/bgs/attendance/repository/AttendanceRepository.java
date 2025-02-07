package com.ssafy.bgs.attendance.repository;

import com.ssafy.bgs.attendance.entity.Attendance;
import com.ssafy.bgs.attendance.dto.response.AttendanceCheckResponseDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {

    @Query("SELECT new com.ssafy.bgs.attendance.dto.response.AttendanceCheckResponseDto(" +
            "a.attendanceId, a.attendanceDate, a.gymName) " +
            "FROM Attendance a " +
            "WHERE a.attendanceDate BETWEEN :startDate AND :endDate " +
            "AND a.userId = :userId")
    List<AttendanceCheckResponseDto> findAttendancesBetweenDatesAndUser(
            @Param("userId") Integer userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
