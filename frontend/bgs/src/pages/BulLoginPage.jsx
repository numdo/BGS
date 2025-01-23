import React, { useState } from "react";
import { Link } from "react-router-dom";

const BulLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("로그인 시도:", email, password);
  };

  return (
    <div className="flex flex-col justify-evenly h-screen bg-white p-4">
      {/* 화면 상단: 로그인 제목 */}
      <div className="text-center">
        <h1 className="text-4xl font-bold">로그인</h1>
      </div>

      {/* 화면 중단: 입력 폼 및 비밀번호/회원가입 */}
      <div className="flex flex-col items-center space-y-6">
        {/* 아이디 및 비밀번호 입력 */}
        <form className="w-full max-w-md space-y-4">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded border-black drop-shadow-lg focus:outline-none focus:ring focus:ring-blue-300"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded border-black drop-shadow-lg focus:outline-none focus:ring focus:ring-blue-300"
          />
        </form>

        {/* 비밀번호 찾기 및 회원가입 */}
        <div className="w-full max-w-md space-y-2 text-right">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            비밀번호를 잊으셨나요?
          </Link>
          <hr className="border-black" />
          <Link
            to="/signup"
            className="text-sm font-black text-black hover:underline"
          >
            &gt;회원가입
          </Link>
        </div>
      </div>

      {/* 화면 하단: 로그인 버튼 */}
      <div className="w-full max-w-md mx-auto">
        <button
          onClick={handleLogin}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          로그인
        </button>
      </div>
    </div>
  );
};

export default BulLoginPage;
