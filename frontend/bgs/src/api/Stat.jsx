import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/stats";

// ✅ 몸무게 히스토리 조회
export async function getWeightHistories() {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/weight-histories`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ✅ 몸무게 히스토리 추가
export async function addWeightHistory(weightRequestDto) {
  try {
    const response = await axiosInstance.post(
      `${BASE_URL}/weight-histories`,
      weightRequestDto
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ✅ 운동 밸런스 조회 (scope: all, week, month, year)
export async function getWorkoutBalance(scope = "all") {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/workout-balance`, {
      params: { scope },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ✅ 부위별 볼륨 조회
export async function getPartVolume() {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/part-volume`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


// ✅ 3대 운동 조회
export async function getWorkoutRecord() {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/workout-record`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ✅ 3대 운동 예상 1RM 조회
export async function getOrm() {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/orm`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ✅ GPT-3 통한 종합 조언 조회
export async function getComprehensiveAdvice() {
  try {
    const response = await axiosInstance.get(`/stats/comprehensive-advice`);
    return response.data; // GPT 응답(문자열)
  } catch (error) {
    console.error(error);
    throw error;
  }
}

