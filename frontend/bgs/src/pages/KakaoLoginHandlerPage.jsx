import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const KakaoLoginHandlerPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKakaoLogin = async () => {
      const code = new URL(window.location.href).searchParams.get("code");

      if (code) {
        try {
          // ✅ 카카오 로그인 콜백 API 호출
          const response = await axios.get(
            `https://i12c209.p.ssafy.io/api/auth/kakao/callback?code=${code}`
          );

          console.log("카카오 로그인 성공:", response.data);

          // ✅ 응답에서 데이터 추출
          const { userId, accessToken, refreshToken } = response.data;

          // ✅ 토큰을 localStorage에 저장
          localStorage.setItem("userId", userId);
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);

          console.log("Access Token:", localStorage.getItem("accessToken"));
          console.log("Refresh Token:", localStorage.getItem("refreshToken"));

          // ✅ KakaoRedirectPage로 이동 (회원가입 여부 확인)
          navigate("/auth/kakao/callback");
        } catch (error) {
          console.error("카카오 로그인 실패:", error);

          if (error.response && error.response.status === 400) {
            alert("잘못된 인가 코드입니다. 다시 로그인해 주세요.");
          } else {
            alert("카카오 로그인 중 오류가 발생했습니다. 다시 시도해 주세요.");
          }

          navigate("/login"); // 로그인 실패 시 로그인 페이지로 이동
        }
      }
    };

    handleKakaoLogin();
  }, [navigate]);

  return <div>카카오 로그인 중... 잠시만 기다려 주세요.</div>;
};

export default KakaoLoginHandlerPage;
