import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/diaries";

// ✅ 특정 유저의 게시물 개수 가져오기
export async function getUserPostCount(userId) {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/count`, {
      params: { userId }, // 특정 유저 ID를 기준으로 게시물 조회
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return 0;
  }
}

// ✅ 피드 목록 조회 (페이지네이션, userId 포함 가능)
export async function getFeeds(userId = "", page = 1, pageSize = 9) {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/feeds`, {
      params: { userId, page, pageSize },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function fetchDiaryFeeds(page, pageSize = 9) {
  try {
    const response = await axiosInstance.get("/diaries/feeds", {
      params: { page, pageSize },
    });
    return response.data;
  } catch (error) {
    console.error("일지 피드를 불러오는 중 오류 발생:", error);
    throw error;
  }
}


export async function fetchEvaluationFeeds(page, pageSize = 9, closed = undefined) {
  try {
    const response = await axiosInstance.get("/evaluations/feeds", {
      params: { page, pageSize, closed },
    });
    // 백엔드가 배열을 반환하므로 그대로 리턴
    return response.data;
  } catch (error) {
    console.error("평가 피드를 불러오는 중 오류 발생:", error);
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
    console.error(error);
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
    console.error(error);
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
    console.error(error);
    throw error;
  }
}

// ✅ 댓글 목록 조회
export async function getComments(diaryId) {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/${diaryId}/comments`);
    return response.data;
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
    console.error(error);
    throw error;
  }
}
