import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const GoogleRedirectPage = () => {
  const navigate = useNavigate();
  const isHandled = useRef(false); // ✅ 중복 실행 방지

  useEffect(() => {
    if (isHandled.current) return;
    isHandled.current = true;

    const handleGoogleLogin = () => {
      try {
        // ✅ URL에서 해시 값 가져오기 (카카오 로그인과 동일하게 처리)
        const hash = window.location.hash.substring(1); // # 제거
        const params = new URLSearchParams(hash);

        const accessToken = params.get("accessToken");
        const refreshToken = params.get("refreshToken");
        const newUser = params.get("newUser") === "true";

        console.log("🔹 [Google] 토큰 저장 처리 중...");

        if (accessToken && refreshToken) {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);

          setTimeout(() => {
            if (newUser) {
              navigate(`/social-signup`);
            } else {
              navigate("/");
            }
          }, 500);
        } else {
          console.error("❌ [Google] 로그인 실패: 유효한 토큰 없음");
          alert("구글 로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
          navigate("/login");
        }
      } catch (error) {
        console.error("❌ [Google] 로그인 처리 중 오류 발생:", error);
        alert("구글 로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
        navigate("/login");
      }
    };

    handleGoogleLogin();
  }, [navigate]);

  return <div>구글 로그인 중... 잠시만 기다려 주세요.</div>;
};

export default GoogleRedirectPage;
