import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/attendance"; // 출석 체크 관련 API 기본 경로

// ✅ 현재 달의 출석 체크 정보 조회
export async function getCurrentMonthAttendance() {
  try {
    // axiosInstance는 Authorization 헤더 등을 미리 설정했다고 가정
    const response = await axiosInstance.get(`${BASE_URL}/current-month`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ✅ 출석 체크 기록 등록 (예: 사용자가 출석 체크 버튼을 눌렀을 때)
export async function checkAttendance(attendanceData) {
  try {
    // attendanceData: { userId, gymId, gymName, ... } 등 출석 체크에 필요한 데이터
    const response = await axiosInstance.post(`${BASE_URL}/check`, attendanceData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ✅ 특정 날짜의 출석 체크 정보 조회 (옵션)
export async function getAttendanceByDate(date) {
  try {
    // date 형식은 백엔드에서 처리하는 형식에 맞춰 전달 (예: YYYY-MM-DD)
    const response = await axiosInstance.get(`${BASE_URL}`, {
      params: { date },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
