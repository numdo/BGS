import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const KakaoRedirectPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKakaoLogin = async () => {
      try {
        // ✅ URL에서 해시 값 가져오기
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);

        const accessToken = params.get("accessToken");
        const newUser = params.get("newUser") === "true";

        console.log("🔹 [Kakao] 토큰 저장 처리 중...");
        console.log("🔹 [Kakao] accessToken:", accessToken);
        if (accessToken) {
          // ✅ 토큰을 로컬 스토리지에 저장
          localStorage.setItem("accessToken", accessToken);

          setTimeout(() => {
            if (newUser) {
              navigate("/social-signup"); // ✅ 신규 유저일 경우 회원가입 페이지 이동
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
