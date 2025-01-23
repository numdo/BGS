import React from "react";
import { useNavigate } from "react-router-dom";

const SocialLogin = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Welcome to Our App</h1>
      <div className="space-y-4">
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
        >
          프로젝트 로그인
        </button>
        <button
          onClick={() => alert("카카오 로그인 준비 중")}
          className="px-6 py-2 bg-yellow-500 text-white rounded shadow hover:bg-yellow-600"
        >
          카카오 로그인
        </button>
        <button
          onClick={() => alert("구글 로그인 준비 중")}
          className="px-6 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600"
        >
          구글 로그인
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="px-6 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600"
        >
          회원가입
        </button>
      </div>
    </div>
  );
};

export default SocialLogin;
