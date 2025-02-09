import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/users"; // 회원 관련 API 기본 경로
const PASSWORD_CHANGE_URL = "/users/change-password"; // 비밀번호 변경 API 경로
const PASSWORD_RESET_URL = "/users/reset-password"; // 비밀번호 재설정 API 경로

// ✅ 회원 개별 조회
export async function getUser(userId = null) {
  try {
    const url = userId ? `${BASE_URL}/${userId}` : `${BASE_URL}/me`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ✅ 회원 정보 수정
export async function updateUser(userData) {
  try {
    const response = await axiosInstance.patch(`${BASE_URL}/me`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ✅ 회원 탈퇴
export async function deleteUser() {
  try {
    const response = await axiosInstance.delete(`${BASE_URL}/me`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ✅ 비밀번호 변경
export async function changePassword(passwordData) {
  try {
    const response = await axiosInstance.post(
      PASSWORD_CHANGE_URL,
      passwordData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}
