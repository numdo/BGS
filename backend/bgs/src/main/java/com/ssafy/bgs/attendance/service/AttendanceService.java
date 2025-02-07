package com.ssafy.bgs.attendance.service;

import com.ssafy.bgs.attendance.dto.request.AttendanceCheckRequestDto;
import com.ssafy.bgs.attendance.dto.response.AttendanceCheckResponseDto;
import com.ssafy.bgs.attendance.entity.Attendance;
import com.ssafy.bgs.attendance.repository.AttendanceRepository;
import com.ssafy.bgs.gym.entity.Gym;
import com.ssafy.bgs.gym.exception.GymNotFoundException;
import com.ssafy.bgs.gym.repository.GymRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final GymRepository gymRepository;

    /**
     * 회원의 현재 위치와 헬스장 위치 간 거리를 계산하여 30m 이내일 경우 출석 체크를 진행합니다.
     *
     * @param request 출석 체크 요청 DTO
     */
    @Transactional
    public void checkAttendance(Integer userId, AttendanceCheckRequestDto request) {
        // 전체 영업 중 헬스장 조회 (deleted=false가 @Where 적용되어 있다고 가정)
        List<Gym> gyms = gymRepository.findAll();

        // 위도, 경도 값이 존재하는 헬스장 중에서 사용자와의 거리가 가장 가까운 헬스장을 찾음
        Gym nearestGym = gyms.stream()
                .filter(gym -> gym.getLatitude() != null && gym.getLongitude() != null)
                .min(Comparator.comparingDouble(gym ->
                        calculateDistance(gym.getLatitude(), gym.getLongitude(),
                                request.getLatitude(), request.getLongitude())))
                .orElseThrow(() -> new IllegalArgumentException("헬스장이 존재하지 않습니다."));

        // 선택된 헬스장과 사용자의 거리를 계산
        double distance = calculateDistance(nearestGym.getLatitude(), nearestGym.getLongitude(),
                request.getLatitude(), request.getLongitude());

        // 10m 이내가 아니라면 출석 체크 불가
        if (distance > 10) {
            throw new IllegalArgumentException("헬스장과의 거리가 10m를 초과합니다. (계산된 거리: " + distance + "m)");
        }

        // 조건 충족 시 출석 체크 기록 생성 (헬스장 아이디와 이름 포함)
        Attendance attendance = Attendance.builder()
                .userId(userId)
                .gymId(nearestGym.getGymId())
                .gymName(nearestGym.getGymName())
                .attendanceDate(LocalDate.now())
                .build();
        attendanceRepository.save(attendance);
    }

    /**
     * 두 지점 간의 거리를 Haversine 공식을 이용하여 계산 (미터 단위)
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000; // 지구 반경 (미터)
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    public List<AttendanceCheckResponseDto> getCurrentMonthAttendance(Integer userId) {
        // 현재 날짜를 기준으로 현재 달의 시작일과 종료일 계산
        LocalDate now = LocalDate.now();
        LocalDate startDate = now.withDayOfMonth(1);
        LocalDate endDate = now.withDayOfMonth(now.lengthOfMonth());

        return attendanceRepository.findAttendancesBetweenDatesAndUser(userId, startDate, endDate);
    }

    @Transactional(readOnly = true)
    public List<AttendanceCheckResponseDto> getAttendanceByDate(Integer userId, LocalDate date) {
        // 시작일과 종료일을 동일하게 전달하여 특정 날짜의 출석 정보 조회
        return attendanceRepository.findAttendancesBetweenDatesAndUser(userId, date, date);
    }
}
