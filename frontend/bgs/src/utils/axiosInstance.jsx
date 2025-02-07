// axiosInstance.jsx
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터: localStorage의 accessToken을 헤더에 자동 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 응답 헤더에 새 accessToken이 있다면 업데이트, 401 발생 시 처리
axiosInstance.interceptors.response.use(
  (response) => {
    // 백엔드 JwtAuthenticationFilter에서 재발급된 새 토큰이 있으면 "Authorization" 헤더에 포함되어 있음
    const newAccessToken = response.headers["authorization"];
    if (newAccessToken) {
      // "Bearer " 접두사 제거 후 localStorage 업데이트
      const token = newAccessToken.startsWith("Bearer ")
        ? newAccessToken.slice(7)
        : newAccessToken;
      localStorage.setItem("accessToken", token);
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      // 만료된 토큰으로 인한 인증 실패 시 로그인 페이지로 이동
      window.location.href = "/login";
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
