import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/users";

// ✅ 특정 유저 팔로우
export async function follow(userId) {
  try {
    const response = await axiosInstance.post(
      `${BASE_URL}/following/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ✅ 특정 유저 언팔로우
export async function unfollow(userId) {
  try {
    const response = await axiosInstance.delete(
      `${BASE_URL}/following/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ✅ 팔로잉 목록 조회 (내가 팔로우한 사람들)
export async function getFollowingList() {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/following`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ✅ 팔로워 목록 조회 (나를 팔로우한 사람들)
export async function getFollowerList() {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/follower`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
