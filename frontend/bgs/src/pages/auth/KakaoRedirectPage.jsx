import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const KakaoRedirectPage = () => {
  const navigate = useNavigate();
  const isHandled = useRef(false); // ✅ 중복 실행 방지

  useEffect(() => {
    if (isHandled.current) return; // ✅ 이미 실행된 경우 다시 실행하지 않음
    isHandled.current = true; // ✅ 첫 실행 이후에는 실행 안 하도록 설정

    const handleKakaoLogin = () => {
      try {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);

        const accessToken = params.get("accessToken");
        const refreshToken = params.get("refreshToken");
        const newUser = params.get("newUser") === "true";

        console.log("🔹 [Kakao] 토큰 저장 처리 중...");

        if (accessToken && refreshToken) {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);

          setTimeout(() => {
            if (newUser) {
              navigate(`/social-signup`); // ✅ 신규 유저일 경우 회원가입 페이지 이동
            } else {
              navigate("/"); // ✅ 기존 유저는 메인 페이지 이동
            }
          }, 500);
        } else {
          console.error("❌ [Kakao] 로그인 실패: 유효한 토큰 없음");
          alert("카카오 로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
          navigate("/login");
        }
      } catch (error) {
        console.error("❌ [Kakao] 로그인 처리 중 오류 발생:", error);
        alert("카카오 로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
        navigate("/login");
      }
    };

    handleKakaoLogin();
  }, [navigate]);

  return <div>카카오 로그인 중... 잠시만 기다려 주세요.</div>;
};

export default KakaoRedirectPage;
