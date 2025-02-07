// axiosInstance.jsx
import axios from "axios";


/* ======================================================================
   1. Axios 인스턴스 생성 및 인터셉터 설정
====================================================================== */
const axiosInstance = axios.create({
  baseURL: "https://i12c209.p.ssafy.io/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터: 로컬 스토리지의 accessToken을 자동으로 헤더에 추가
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

// 응답 인터셉터: 401 발생 시 refresh 토큰을 통해 accessToken 재발급 후 재시도
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }
      try {
        const res = await axios.post(
          "https://i12c209.p.ssafy.io/api/auth/refresh", // 서버의 refresh 엔드포인트
          {}, // body는 빈 객체 전송
          {
            headers: {
              "Refresh-Token": refreshToken,
            },
          }
        );
        // 새 accessToken은 응답 헤더 "Authorization"에 담겨 있다고 가정
        const newAccessTokenHeader = res.headers["authorization"];
        if (newAccessTokenHeader) {
          const newAccessToken = newAccessTokenHeader.replace("Bearer ", "");
          localStorage.setItem("accessToken", newAccessToken);
          // 원래 요청의 헤더를 새 토큰으로 업데이트 후 재시도
          error.config.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(error.config);
        } else {
          throw new Error("새 AccessToken 헤더가 없습니다.");
        }
      } catch (err) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

/* ======================================================================
   4. 내보내기
====================================================================== */
export default axiosInstance ;
