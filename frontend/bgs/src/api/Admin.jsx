// src/api/Admin.jsx
import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/admin";

const adminUserApi = {
  // 1. 회원 목록 조회: 쿼리 파라미터로 page, pageSize, keyword 전달
  getAllUsers: async (page = 1, pageSize = 10, keyword = "") => {
    const response = await axiosInstance.get(`${BASE_URL}/users`, {
      params: { page, pageSize, keyword },
    });
    return response.data;
  },

  // 2. 회원 상세 조회
  getUserDetail: async (userId) => {
    const response = await axiosInstance.get(`${BASE_URL}/users/${userId}`);
    return response.data;
  },

  // 3. 회원 정보 수정 (관리자 전용 업데이트)
  updateUser: async (userId, updateData) => {
    const response = await axiosInstance.patch(`${BASE_URL}/users/${userId}`, updateData);
    return response.data;
  },

  // 4. 회원 삭제 (소프트 삭제)
  deleteUser: async (userId) => {
    const response = await axiosInstance.delete(`${BASE_URL}/users/${userId}`);
    return response.data;
  },

  // 5. 비밀번호 초기화/재설정
  resetPassword: async (userId, newPassword) => {
    const response = await axiosInstance.post(`${BASE_URL}/users/${userId}/reset-password`, { newPassword });
    return response.data;
  },
};

export default adminUserApi;
