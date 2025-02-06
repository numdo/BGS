import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/gyms"; // 헬스장 관련 API 기본 경로
const MACHINE_BASE_URL = "/machines"; // 머신 관련 API 기본 경로

// ✅ 헬스장 목록 조회 (페이지네이션 포함)
export async function getGyms(page = 0, size = 10) {
  try {
    const response = await axiosInstance.get(BASE_URL, {
      params: { page, size },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ✅ 헬스장 등록
export async function createGym(gymData) {
  try {
    const response = await axiosInstance.post(BASE_URL, gymData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ✅ 머신 목록 조회
export async function getMachines() {
  try {
    const response = await axiosInstance.get(MACHINE_BASE_URL);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ✅ 특정 헬스장에 머신 등록
export async function createGymMachine(gymId, machineId) {
  try {
    const response = await axiosInstance.post(
      `${BASE_URL}/${gymId}/machines/${machineId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ✅ 특정 헬스장의 머신 목록 조회
export async function getGymMachines(gymId) {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/${gymId}/machines`);
    return response.data;
  } catch (error) {
    throw error;
  }
}
