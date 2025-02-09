import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const KakaoRedirectPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKakaoLogin = async () => {
      try {
        // URL 해시에서 파라미터 추출
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get("accessToken");
        // 서버가 임시 토큰인 경우 newUser 플래그를 true로 전달하도록 합니다.
        const newUser = params.get("newUser") === "true";

        console.log("🔹 [Kakao] 토큰 저장 처리 중...");
        console.log("🔹 [Kakao] accessToken:", accessToken);
        if (accessToken) {
          // 토큰 저장
          localStorage.setItem("accessToken", accessToken);
          setTimeout(() => {
            if (newUser) {
              navigate("/social-signup"); // 신규 유저(추가 정보 입력 필요)인 경우
            } else {
              navigate("/"); // 기존 유저
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

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-white">
      {/* 로딩 스피너 (Tailwind 예시) */}
      <div className="mb-6">
        <svg
          className="animate-spin h-10 w-10 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 11-8 8z"
          />
        </svg>
      </div>

      {/* 로딩 문구 */}
      <p className="text-gray-700 text-xl font-semibold mb-2">
        카카오 로그인 중...
      </p>
      <p className="text-gray-500">잠시만 기다려 주세요</p>
    </div>
  );
};

export default KakaoRedirectPage;
