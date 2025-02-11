import axios from "axios";
const BASE_URL = "https://i12c209.p.ssafy.io/";

export async function getDiaries(userId) {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const response = await axios.get("https://i12c209.p.ssafy.io/api/diaries", {
      params: {
        userId: userId,
        year: 2025,
        //month:1
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("getdiary함수 실행", response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createDiary(formData) {
  try {
    const accessToken = localStorage.getItem("accessToken");
    axios.post("https://i12c209.p.ssafy.io/api/diaries", formData, {
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
    const response = await axios.get(BASE_URL + `/api/diaries/${diaryId}`, {
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
  const accessToken = localStorage.getItem("accessToken");
  axios.patch(`https://i12c209.p.ssafy.io/api/diaries/${diaryId}`, formData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function deleteDiary(diaryId) {
  try {
    const accessToken = localStorage.getItem("accessToken");
    axios.delete(BASE_URL + `/api/diaries/${diaryId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}
