import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ✅ 토큰 유효성 검사 및 자동 갱신 훅
const useTokenManager = () => {
  const navigate = useNavigate();

  // ✅ 토큰 유효성 검사 및 갱신 함수
  const checkAndRefreshToken = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!accessToken || !refreshToken) {
      console.warn("❌ 토큰 없음. 로그인 페이지로 이동");
      handleLogout();
      return;
    }

    try {
      // ✅ AccessToken이 유효한지 확인 (API 요청)
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
            {
              refreshToken,
            }
          );

          // ✅ 새 AccessToken 저장
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

  // ✅ 로그아웃 함수
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    alert("로그아웃 되었습니다.");
    navigate("/login");
  };

  // ✅ 페이지 로드 시 토큰 체크 + 주기적인 체크 (10분마다)
  useEffect(() => {
    checkAndRefreshToken();
    const interval = setInterval(checkAndRefreshToken, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return null;
};

export default useTokenManager;
