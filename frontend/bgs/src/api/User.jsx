import axiosInstance from "../utils/axiosInstance";
const BASE_URL = "/users"; // 회원 관련 API 기본 경로
const PASSWORD_CHANGE_URL = "/users/change-password"; // 비밀번호 변경 API 경로

// ✅ 회원 개별 조회
export async function getUser(userId = 0) {
  try {
    if (userId === 0) {
      const response = await axiosInstance.get(`${BASE_URL}/me`);
      return response.data;
    } else {
      const response = await axiosInstance.get(`${BASE_URL}/${userId}`);
      return response.data;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ✅ 회원 정보 수정
export async function updateUser(userData) {
  try {
    const response = await axiosInstance.patch(`${BASE_URL}/me`, userData);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ✅ 회원 탈퇴
export async function deleteUser() {
  const response = await axiosInstance.delete(`${BASE_URL}/me`);
  return response.data;
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
    console.error(error);
    throw error;
  }
}

// 닉네임 중복 체크 (GET /auth/nickname-check/{nickname})
export async function checkNickname(nickname) {
  try {
    const response = await axiosInstance.get(
      `${BASE_URL}/nickname-check/${nickname}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
