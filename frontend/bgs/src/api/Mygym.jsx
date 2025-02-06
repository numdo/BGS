import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/mygyms";

// ✅ 마이짐 배치 조회
export async function getMygym(userId) {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ✅ 마이짐 배치 수정
export async function updateMygym(userId, layoutData) {
  try {
    const response = await axiosInstance.put(
      `${BASE_URL}/${userId}`,
      layoutData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ✅ 방명록 조회
export async function getGuestBooks(userId) {
  try {
    const response = await axiosInstance.get(
      `${BASE_URL}/${userId}/guestbooks`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ✅ 방명록 작성
export async function createGuestBooks(userId, content) {
  try {
    const response = await axiosInstance.post(
      `${BASE_URL}/${userId}/guestbooks`,
      { content }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ✅ 방명록 수정
export async function updateGuestBook(userId, guestbookId, content) {
  try {
    const response = await axiosInstance.patch(
      `${BASE_URL}/${userId}/guestbooks/${guestbookId}`,
      {
        content,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ✅ 방명록 삭제
export async function deleteGuestBook(userId, guestbookId) {
  try {
    const response = await axiosInstance.delete(
      `${BASE_URL}/${userId}/guestbooks/${guestbookId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}
