import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ✅ 토큰 유효성 검사 및 자동 갱신 훅
const useTokenManager = () => {
  const navigate = useNavigate();
  const isTokenChecked = useRef(false); // ✅ 중복 실행 방지

  const checkAndRefreshToken = async () => {
    if (isTokenChecked.current) return; // ✅ 이미 실행된 경우 다시 실행하지 않음
    isTokenChecked.current = true; // ✅ 첫 실행 이후에는 실행 안 하도록 설정

    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!accessToken || !refreshToken) {
      console.warn("❌ 토큰 없음. 로그인 페이지로 이동");
      handleLogout();
      return;
    }

    try {
      await axios.get("https://i12c209.p.ssafy.io/api/users/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      console.log("✅ 토큰 유효");
    } catch (error) {
      if (error.response?.status === 401) {
        console.warn("🔄 AccessToken 만료. RefreshToken으로 재발급 시도");
        try {
          const res = await axios.post(
            "https://i12c209.p.ssafy.io/api/users/refresh-token",
            { refreshToken }
          );

          localStorage.setItem("accessToken", res.data.accessToken);
          console.log("✅ AccessToken 갱신 성공");
        } catch (err) {
          console.error("❌ RefreshToken도 만료됨. 로그아웃 처리");
          handleLogout();
        }
      } else {
        console.error("❌ 토큰 확인 중 오류 발생:", error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    alert("로그아웃 되었습니다.");
    navigate("/login");
  };

  useEffect(() => {
    checkAndRefreshToken();
    const interval = setInterval(checkAndRefreshToken, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return null;
};

export default useTokenManager;
