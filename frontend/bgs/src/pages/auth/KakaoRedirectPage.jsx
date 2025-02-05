import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const KakaoRedirectPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKakaoLogin = () => {
      // ✅ 현재 URL에서 서버가 전달한 쿼리 파라미터 추출
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get("accessToken");
      const refreshToken = params.get("refreshToken");
      const newUser = params.get("newUser") === "true"; // "true" → boolean 변환

      if (accessToken && refreshToken) {
        console.log("✅ 카카오 로그인 성공!");

        // ✅ 토큰을 localStorage에 저장
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        // ✅ 회원 여부에 따라 페이지 이동
        if (newUser) {
          navigate("/social-signup?provider=kakao");
        } else {
          navigate("/");
        }
      } else {
        console.error("❌ 카카오 로그인 실패: 유효한 토큰 없음");
        alert("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
        navigate("/login");
      }
    };

    handleKakaoLogin();
  }, [navigate]);

  return <div>카카오 로그인 중... 잠시만 기다려 주세요.</div>;
};

export default KakaoRedirectPage;
