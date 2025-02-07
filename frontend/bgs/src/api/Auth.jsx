import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/users";

// ✅ 회원가입
export async function signup(userData) {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/signup`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ✅ 로그인
export async function login(credentials) {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/login`, credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ✅ 로그아웃
export const handleLogout = async (navigate) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      console.warn("이미 로그아웃됨");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/login");
      return;
    }

    await axiosInstance.post(`${BASE_URL}/logout`, null, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    alert("로그아웃 되었습니다.");
  } catch (error) {
    console.error("로그아웃 실패:", error);
    alert("로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.");
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  }
};

// ✅ 카카오 추가 회원가입
export async function kakaoSignup(userId, kakaoData) {
  try {
    const response = await axiosInstance.patch(
      `${BASE_URL}/${userId}/kakao-signup`,
      kakaoData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ✅ 이메일 인증 코드 전송
export async function sendEmailVerify(email) {
  try {
    const response = await axiosInstance.post(
      `${BASE_URL}/email-verification`,
      null,
      { params: { email } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ✅ 이메일 검증 완료 코드 입력
export async function receiveEmailVerify(email, code) {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/verify-code`, null, {
      params: { email, code },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
