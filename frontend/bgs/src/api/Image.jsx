import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/users/me/profile-image"; // 프로필 이미지 업로드 API 경로

// ✅ 사용자 프로필 이미지 업로드
export async function uploadProfileImage(profileImage) {
  try {
    const formData = new FormData();

    // 프로필 이미지 추가 (파일 객체)
    if (profileImage) {
      formData.append("profileImage", profileImage);
    } else {
      throw new Error("프로필 이미지 파일이 필요합니다.");
    }

    const response = await axiosInstance.patch(BASE_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
