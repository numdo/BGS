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

export async function login(credentials) {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/login`, credentials);
    
    // 응답 헤더에서 토큰 추출 (키를 소문자로 사용)
    const accessTokenHeader = response.headers["authorization"];
    const refreshTokenHeader = response.headers["refresh-token"];
    
    if (accessTokenHeader) {
      // "Bearer " 접두사가 있을 경우 제거하고 저장
      const token = accessTokenHeader.startsWith("Bearer ")
        ? accessTokenHeader.slice(7)
        : accessTokenHeader;
      localStorage.setItem("accessToken", token);
    }
    
    if (refreshTokenHeader) {
      const token = refreshTokenHeader.startsWith("Bearer ")
        ? refreshTokenHeader.slice(7)
        : refreshTokenHeader;
      localStorage.setItem("refreshToken", token);
    }
    
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
