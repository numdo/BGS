import { useNavigate } from "react-router-dom";
import LogoSection from "../../components/common/LogoSection";
import kakaoLogo from "../../assets/images/kakao-logo.png";

const LoginPage = () => {
  const navigate = useNavigate();

  // 카카오 로그인
  const handleKakaoLogin = () => {
    window.location.href = "https://i12c209.p.ssafy.io/api/auth/kakao/login";
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white px-4">
      {/* 로고 섹션 */}
      <LogoSection />
      {/* 버튼 섹션 */}
      <div className="w-full max-w-md flex flex-col space-y-4 justify-center">
        {/* 불끈 계정으로 로그인 */}
        <button
          onClick={() => navigate("/bgslogin")}
          className="w-2/3 mx-auto px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 flex items-center space-x-2"
        >
          <span className="flex-grow text-center">불끈 계정으로 로그인</span>
        </button>

        {/* 카카오 로그인 */}
        <button
          onClick={handleKakaoLogin}
          className="w-2/3 mx-auto px-4 py-2 bg-yellow-300 text-black rounded shadow hover:bg-yellow-400 flex items-center space-x-2"
        >
          <img src={kakaoLogo} alt="Kakao Logo" className="w-6 h-6 mr-2" />
          <span className="flex-grow text-center">카카오 로그인</span>
        </button>
      </div>

      {/* 가로선 및 회원가입 텍스트 */}
      <div className="flex flex-col items-center w-full max-w-md mt-4">
        <div className="flex items-center justify-center w-2/3 mx-auto">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-gray-500 text-sm">또는</span>
          <hr className="flex-grow border-gray-300" />
        </div>
        <p
          onClick={() => navigate("/signup")}
          className="text-center text-blue-500 cursor-pointer hover:underline mt-4"
        >
          회원가입
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
