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
    <div className="flex flex-col justify-between h-screen bg-white p-4">
      {/* 로그인 제목 */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">로그인</h1>
      </div>

      {/* 로그인 폼 */}
      <form onSubmit={handleLogin} className="flex flex-col space-y-4 mb-auto">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
        />
      </form>

      {/* 비밀번호 찾기 및 회원가입 */}
      <div className="flex flex-col items-center space-y-2">
        <Link
          to="/forgot-password"
          className="text-sm text-blue-500 hover:underline"
        >
          비밀번호 찾기
        </Link>
        <div className="flex items-center space-x-2">
          <hr className="w-24 border-gray-300" />
          <span className="text-gray-600">또는</span>
          <hr className="w-24 border-gray-300" />
        </div>
        <Link to="/signup" className="text-sm text-blue-500 hover:underline">
          회원가입
        </Link>
      </div>

      {/* 로그인 버튼 */}
      <div className="mt-4">
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          로그인
        </button>
      </div>
    </div>
  );
};

export default BulLoginPage;
