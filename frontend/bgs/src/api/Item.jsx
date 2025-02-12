// src/api/Item.jsx
import axiosInstance from "../utils/axiosInstance";

const API_URL = "/admin/items";

const itemApi = {
  // 아이템 전체 목록 조회
  getAllItems: async (page = 1, pageSize = 10, keyword) => {
    const response = await axiosInstance.get(API_URL, {
      params: { page, pageSize, keyword },
    });
    return response.data;
  },
  // 아이템 생성 (FormData 사용)
  createItem: async (formData) => {
    const response = await axiosInstance.post(`${API_URL}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  // 아이템 수정 (FormData 사용)
  updateItem: async (itemId, formData) => {
    const response = await axiosInstance.patch(`${API_URL}/${itemId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  // 아이템 활성화/비활성화 토글
  toggleItemStatus: async (itemId, status) => {
    // status는 "enable" 또는 "disable" 문자열
    const response = await axiosInstance.patch(`${API_URL}/${itemId}/${status}`);
    return response.data;
  },
};

export default itemApi;
