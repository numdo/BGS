import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo+name.png";
import kakaoLogo from "../assets/kakao-logo.png";
import googleLogo from "../assets/google-logo.png";

const SocialLogin = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white px-4">
      {/* 로고 섹션 */}
      <div className="text-center mb-8">
        <img src={logo} alt="App Logo" className="w-72 h-80 mx-auto mb-4" />
      </div>

      {/* 버튼 섹션 */}
      <div className="w-full max-w-md flex flex-col space-y-4 justify-center">
        {/* 불끈 계정으로 로그인 */}
        <button
          onClick={() => navigate("/bullogin")}
          className="w-2/3 mx-auto px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 flex items-center space-x-2"
        >
          <span className="flex-grow text-center">불끈 계정으로 로그인</span>
        </button>

        {/* 카카오 로그인 */}
        <button
          onClick={() => alert("카카오 로그인 준비 중")}
          className="w-2/3 mx-auto px-4 py-2 bg-yellow-300 text-black rounded shadow hover:bg-yellow-400 flex items-center space-x-2"
        >
          <img src={kakaoLogo} alt="Kakao Logo" className="w-6 h-6 mr-2" />
          <span className="flex-grow text-center">카카오 로그인</span>
        </button>

        {/* 구글 로그인 */}
        <button
          onClick={() => alert("구글 로그인 준비 중")}
          className="w-2/3 mx-auto px-4 py-2 bg-white text-blue-500 border border-blue-500 rounded shadow hover:bg-blue-100 flex items-center space-x-2"
        >
          <img src={googleLogo} alt="Google Logo" className="w-6 h-6 mr-2" />
          <span className="flex-grow text-center">구글 로그인</span>
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

export default SocialLogin;
