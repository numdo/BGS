import axios from "axios";
const BASE_URL = "https://i12c209.p.ssafy.io/";

export async function getDiaries(userId, year, month) {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const response = await axios.get(`${BASE_URL}api/diaries`, {
      params: {
        userId: userId,
        year: year,
        month: month, // 전달된 month 값 사용 (예: 1이면 1월)
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createDiary(formData) {
  try {
    const accessToken = localStorage.getItem("accessToken");
    await axios.post(`${BASE_URL}api/diaries`, formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getDiary(diaryId) {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const response = await axios.get(`${BASE_URL}api/diaries/${diaryId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function updateDiary(diaryId, formData) {
  try {
    const accessToken = localStorage.getItem("accessToken");
    await axios.patch(`${BASE_URL}api/diaries/${diaryId}`, formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteDiary(diaryId) {
  try {
    const accessToken = localStorage.getItem("accessToken");
    await axios.delete(`${BASE_URL}api/diaries/${diaryId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}
