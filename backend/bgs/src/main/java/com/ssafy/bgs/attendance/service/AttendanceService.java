package com.ssafy.bgs.attendance.service;

import com.ssafy.bgs.attendance.dto.request.AttendanceCheckRequestDto;
import com.ssafy.bgs.attendance.dto.response.AttendanceCheckResponseDto;
import com.ssafy.bgs.attendance.entity.Attendance;
import com.ssafy.bgs.attendance.repository.AttendanceRepository;
import com.ssafy.bgs.gym.entity.Gym;
import com.ssafy.bgs.gym.repository.GymRepository;
import com.ssafy.bgs.mygym.entity.CoinHistory;
import com.ssafy.bgs.mygym.repository.CoinHistoryRepository;
import com.ssafy.bgs.user.entity.User;
import com.ssafy.bgs.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final GymRepository gymRepository;
    private final UserRepository userRepository;
    private final CoinHistoryRepository coinHistoryRepository;

    @Transactional
    public void checkAttendance(Integer userId, AttendanceCheckRequestDto request) {
        try {
            // 1. 헬스장 위치 확인
            List<Gym> gyms = gymRepository.findAll();
            Gym nearestGym = gyms.stream()
                    .filter(gym -> gym.getLatitude() != null && gym.getLongitude() != null)
                    .min(Comparator.comparingDouble(gym ->
                            calculateDistance(gym.getLatitude(), gym.getLongitude(),
                                    request.getLatitude(), request.getLongitude())))
                    .orElseThrow(() -> new IllegalArgumentException("헬스장이 존재하지 않습니다."));

            double distance = calculateDistance(nearestGym.getLatitude(), nearestGym.getLongitude(),
                    request.getLatitude(), request.getLongitude());
            if (distance > 500) {
                throw new IllegalArgumentException("헬스장과의 거리가 500m를 초과합니다. (계산된 거리: " + distance + "m)");
            }

            // 2. 사용자 조회 및 오늘 출석 여부 확인
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
            LocalDate today = LocalDate.now();
            if (user.getLastAttendance() != null && user.getLastAttendance().isEqual(today)) {
                throw new IllegalArgumentException("오늘 이미 출석하였습니다.");
            }

            // 3. 연속 출석일수(streak) 계산
            int newStreak = 1;
            if (user.getLastAttendance() != null) {
                long gap = ChronoUnit.DAYS.between(user.getLastAttendance(), today);
                if (gap <= 3) {
                    newStreak = (user.getStrickAttendance() == null ? 0 : user.getStrickAttendance()) + (int) gap;
                }
            }

            // 4. 코인 증가량 결정
            int coinIncrement;
            if (newStreak >= 30) {
                coinIncrement = 4;
            } else if (newStreak >= 5) {
                coinIncrement = 3;
            } else {
                coinIncrement = 2;
            }

            // 5. 사용자 정보 업데이트
            user.setLastAttendance(today);
            user.setStrickAttendance(newStreak);
            user.setCoin((user.getCoin() == null ? 0 : user.getCoin()) + coinIncrement);
            userRepository.save(user);

            // 6. 출석 기록 저장
            Attendance attendance = Attendance.builder()
                    .userId(userId)
                    .gymId(nearestGym.getGymId())
                    .gymName(nearestGym.getGymName())
                    .attendanceDate(today)
                    .build();
            Attendance savedAttendance = attendanceRepository.save(attendance);

            // 7. 코인 증가 내역을 코인히스토리에 기록
            CoinHistory coinHistory = new CoinHistory();
            coinHistory.setUserId(userId);
            coinHistory.setAmount(coinIncrement);
            coinHistory.setUsageType("ATTENDANCE");
            coinHistory.setUsageId(savedAttendance.getAttendanceId());
            coinHistoryRepository.save(coinHistory);

        } catch (Exception e) {
            e.printStackTrace(); // 콘솔에 전체 에러 로그 출력
            throw new RuntimeException("출석 체크 중 서버 오류 발생: " + e.getMessage());
        }
    }


    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000;
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

    @Transactional(readOnly = true)
    public List<AttendanceCheckResponseDto> getAttendanceBetweenDates(Integer userId, LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findAttendancesBetweenDatesAndUser(userId, startDate, endDate);
    }
}
