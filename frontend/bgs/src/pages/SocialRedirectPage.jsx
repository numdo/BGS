import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SocialRedirectPage = () => {
  const navigate = useNavigate();
  const [isHandled, setIsHandled] = useState(false); // 🔹 중복 실행 방지

  useEffect(() => {
    if (isHandled) return; // 🔹 이미 실행된 경우 다시 실행하지 않음

    const handleSocialLogin = () => {
      try {
        // ✅ URL에서 해시 값 가져오기
        const hash = window.location.hash.substring(1); // # 제거
        const params = new URLSearchParams(hash);

        const accessToken = params.get("accessToken");
        const refreshToken = params.get("refreshToken");
        const newUser = params.get("newUser") === "true";

        console.log("🔹 추출된 토큰 데이터:", {
          accessToken,
          refreshToken,
          newUser,
        });

        if (accessToken && refreshToken) {
          // ✅ 토큰을 localStorage에 저장
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);

          // ✅ 회원 여부에 따라 페이지 이동
          setTimeout(() => {
            if (newUser) {
              navigate(`/social-signup`);
            } else {
              navigate("/");
            }
          }, 500);
        } else {
          console.error("❌ 로그인 실패: 유효한 토큰 없음");
          alert("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
          navigate("/login");
        }
      } catch (error) {
        console.error("❌ 로그인 처리 중 오류 발생:", error);
        alert("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
        navigate("/login");
      } finally {
        setIsHandled(true); // 🔹 중복 실행 방지 플래그 설정
      }
    };

    handleSocialLogin();
  }, [navigate, isHandled]); // 🔹 `isHandled`이 변경될 때만 실행

  return <div>로그인 중... 잠시만 기다려 주세요.</div>;
};

export default SocialRedirectPage;
