import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/users/me"; // 회원 관련 API 기본 경로
const PASSWORD_CHANGE_URL = "/users/change-password"; // 비밀번호 변경 API 경로
const PASSWORD_RESET_URL = "/users/reset-password"; // 비밀번호 재설정 API 경로

// ✅ 회원 개별 조회
export async function getUser() {
  try {
    const response = await axiosInstance.get(BASE_URL);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ✅ 회원 정보 수정
export async function updateUser(userData) {
  try {
    const response = await axiosInstance.patch(BASE_URL, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ✅ 회원 탈퇴
export async function deleteUser() {
  try {
    const response = await axiosInstance.delete(BASE_URL);
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

// ✅ 비밀번호 재설정 (이메일로 재설정 요청)
export async function resetPassword(email) {
  try {
    const response = await axiosInstance.post(PASSWORD_RESET_URL, { email });
    return response.data;
  } catch (error) {
    throw error;
  }
}
