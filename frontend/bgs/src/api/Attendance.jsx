// src/api/Attendance.js
import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/attendance";

// ✅ 오늘 출석 체크 (POST /api/attendance/check)
export async function checkAttendance(attendanceData) {
  // try {
  //   const response = await axiosInstance.post(
  //     `${BASE_URL}/check`,
  //     attendanceData
  //   );
  //   return response.data;
  // } 
  try {
    const response = await axiosInstance.post(
      `${BASE_URL}/check`,
      attendanceData
    );
    return response.data;
  } 
  catch (error) {
    console.error(error);
    throw error;
  }
}

// ✅ 현재 달 출석 조회 (GET /api/attendance/current-month)
export async function getCurrentMonthAttendance() {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/current-month`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ✅ 특정 날짜 출석 조회 (GET /api/attendance/date?date=YYYY-MM-DD)
export async function getAttendanceByDate(date) {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/date`, {
      params: { date },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ✅ 지정 범위 내 출석 조회 (GET /api/attendance/range?start=YYYY-MM-DD&end=YYYY-MM-DD)
export async function getAttendanceByRange(start, end) {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/range`, {
      params: { start, end },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
