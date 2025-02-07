import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/diaries";

// ✅ 피드 목록 조회 (페이지네이션, userId 포함 가능)
export async function getFeeds(userId = "", page = 1, pageSize = 9) {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/feeds`, {
      params: { userId, page, pageSize },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ✅ 다이어리 좋아요
export async function likeDiary(diaryId, userId) {
  try {
    const response = await axiosInstance.post(
      `${BASE_URL}/${diaryId}/liked`,
      userId,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ✅ 다이어리 좋아요 취소
export async function unlikeDiary(diaryId, userId) {
  try {
    const response = await axiosInstance.delete(
      `${BASE_URL}/${diaryId}/liked`,
      {
        data: userId, // DELETE 요청에서도 body를 포함해야 함
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ✅ 댓글 작성
export async function createComment(diaryId, commentData) {
  try {
    const response = await axiosInstance.post(
      `${BASE_URL}/${diaryId}/comments`,
      commentData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ✅ 댓글 목록 조회
export async function getComments(diaryId) {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/${diaryId}/comments`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ✅ 댓글 수정
export async function updateComment(diaryId, commentId, content) {
  try {
    const response = await axiosInstance.patch(
      `${BASE_URL}/${diaryId}/comments/${commentId}`,
      {
        commentId,
        content,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ✅ 댓글 삭제
export async function deleteComment(diaryId, commentId) {
  try {
    const response = await axiosInstance.delete(
      `${BASE_URL}/${diaryId}/comments/${commentId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}
