package com.ssafy.bgs.attendance.repository;

import com.ssafy.bgs.attendance.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
}
