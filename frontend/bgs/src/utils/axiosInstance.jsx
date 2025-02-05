import axios from "axios";

// ✅ Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: "https://i12c209.p.ssafy.io/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ 요청 인터셉터: 자동으로 accessToken 추가
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

// ✅ 응답 인터셉터: accessToken 만료 시 refreshToken으로 재발급
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log("🔄 AccessToken 만료, RefreshToken으로 재발급 시도");

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        console.error("❌ RefreshToken 없음. 로그인 페이지로 이동");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          "https://i12c209.p.ssafy.io/api/auth/refresh",
          {
            refreshToken,
          }
        );

        // ✅ 새 accessToken 저장
        localStorage.setItem("accessToken", res.data.accessToken);

        // ✅ 원래 요청 재시도
        error.config.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return axios(error.config);
      } catch (err) {
        console.error("🔴 RefreshToken 재발급 실패. 로그인 필요");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
