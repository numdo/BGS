import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/evaluations"; // baseURL이 이미 설정되어 있으므로 API 경로만 입력

// 평가 게시물 전체 조회 (페이지네이션 포함)
export async function getEvaluations(page = 1, pageSize = 10) {
  try {
    const response = await axiosInstance.get(BASE_URL, {
      params: { page, pageSize },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// 특정 평가 게시물 상세 조회
export async function getEvaluation(evaluationId) {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/${evaluationId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// 평가 게시물 등록
export async function createEvaluation(evaluationData) {
  try {
    const response = await axiosInstance.post(BASE_URL, evaluationData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// 평가 게시물 수정
export async function updateEvaluation(evaluationId, updateData) {
  try {
    const response = await axiosInstance.patch(
      `${BASE_URL}/${evaluationId}`,
      updateData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

// 평가 게시물 삭제
export async function deleteEvaluation(evaluationId) {
  try {
    const response = await axiosInstance.delete(`${BASE_URL}/${evaluationId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// 특정 평가 게시물에 투표하기
export async function vote(evaluationId, userId, approval) {
  try {
    const response = await axiosInstance.post(
      `${BASE_URL}/${evaluationId}/votes`,
      {
        user_id: userId,
        approval,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}
