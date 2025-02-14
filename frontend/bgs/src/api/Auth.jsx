// api/Auth.js
import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/auth";

// 회원가입 (변경 사항 없으므로 그대로 사용)
export async function signup(userData) {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/signup`, userData);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// 로그인 (백엔드에서 accessToken만 응답 헤더에 포함)
export async function login(credentials) {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/login`, credentials);
    const accessTokenHeader = response.headers["authorization"];

    if (accessTokenHeader) {
      const token = accessTokenHeader.startsWith("Bearer ")
        ? accessTokenHeader.slice(7)
        : accessTokenHeader;
      localStorage.setItem("accessToken", token);
    }

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// 로그아웃 (accessToken 삭제)
export const handleLogout = async (navigate) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      await axiosInstance.post(`${BASE_URL}/logout`, null, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }
  } catch (error) {
    console.error("로그아웃 중 오류 발생", error);
  } finally {
    localStorage.removeItem("accessToken");
    navigate("/login");
  }
};

// 이메일 인증 코드 전송
export async function sendEmailVerify(email) {
  try {
    const response = await axiosInstance.post(
      `${BASE_URL}/email-verification`,
      null,
      { params: { email } }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// 이메일 인증 코드 확인
export async function receiveEmailVerify(email, code) {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/verify-code`, null, {
      params: { email, code },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
export async function socialSignup(socialData) {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const response = await axiosInstance.patch(
      `${BASE_URL}/me/social-signup`,
      socialData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// 닉네임 중복 체크 (GET /auth/nickname-check?nickname={nickname})
export async function checkNickname(nickname) {
  // 닉네임 길이 검사
  if (nickname.length > 12) {
    return Promise.reject(new Error("닉네임은 12자 이하여야 합니다."));
  }

  try {
    const response = await axiosInstance.get(`${BASE_URL}/nickname-check`, {
      params: { nickname },
    });

    return response.data;
  } catch (error) {
    console.error("닉네임 중복 체크 오류:", error.message);
    throw error;
  }
}


// 비밀번호 재설정 (POST /auth/reset-password)
// 요청 body는 { email: "..." } 형식
export async function resetPassword(email) {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/reset-password`, {
      email,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function checkEmail(email) {
  try {
    const response = await axiosInstance.get(
      `${BASE_URL}/email-check/${email}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
