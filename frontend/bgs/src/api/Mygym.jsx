// src/api/Mygym.jsx
import axios from "axios";
const BASE_URL = "https://i12c209.p.ssafy.io/";
// 사용자ID 받아 해당 사용자의 마이짐의 정보 GET요청
export async function getMygym(userId) {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.get(BASE_URL + `api/mygyms/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function updateMygym(userId, object) {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.put(
      BASE_URL + `api/mygyms/${userId}`,
      object,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// 방명록 목록 조회
export async function getGuestBooks(userId, page = 0/*, pageSize = 10*/) {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.get(
      `${BASE_URL}api/mygyms/${userId}/guestbooks?page=${page + 1}&pageSize=${1000}&sort=createdAt,desc`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("getGuestBooks 오류:", error);
    throw error;
  }
}


// 방명록 추가
export async function createGuestBooks(userId, object) {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.post(
      `${BASE_URL}api/mygyms/${userId}/guestbooks`,
      object,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// 방명록 삭제
export async function deleteGuestBook(ownerId, guestbookId) {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.delete(
      `${BASE_URL}api/mygyms/${ownerId}/guestbooks/${guestbookId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// 방명록 업데이트 (PATCH)
export async function updateGuestBook(userId, guestbookId, payload) {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.patch(
      `${BASE_URL}api/mygyms/${userId}/guestbooks/${guestbookId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
