import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const KakaoRedirectPage = () => {
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

          // ✅ 응답 헤더에서도 토큰 확인 (백엔드에 따라 다를 수 있음)
          const accessTokenHeader = response.headers["authorization"];
          const refreshTokenHeader = response.headers["refresh-token"];

          // ✅ 토큰을 localStorage에 저장
          localStorage.setItem("userId", userId);
          localStorage.setItem("accessToken", accessTokenHeader || accessToken);
          localStorage.setItem(
            "refreshToken",
            refreshTokenHeader || refreshToken
          );

          console.log("Access Token:", localStorage.getItem("accessToken"));
          console.log("Refresh Token:", localStorage.getItem("refreshToken"));

          // ✅ 로그인 성공 후, 회원 여부 확인
          if (!userId) {
            // 비회원이면 회원가입 페이지로 이동
            navigate("/kakao-signup");
          } else {
            // 기존 회원이면 메인 페이지로 이동
            navigate("/");
          }
        } catch (error) {
          console.error("카카오 로그인 실패:", error);

          // ✅ 400 에러 처리 (잘못된 인가 코드)
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

export default KakaoRedirectPage;
