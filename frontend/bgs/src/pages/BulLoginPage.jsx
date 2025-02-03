import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance"; // ✅ axiosInstance 사용

const BulLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ✅ 새로고침/재접속 시 자동 로그인
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/users/login", {
        email,
        password,
      });

      console.log("로그인 성공:", response.data);

      // ✅ 로그인 정보 저장 (accessToken & refreshToken)
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);

      // ✅ 임시 비밀번호 여부 확인 후 비밀번호 변경 페이지로 이동
      if (response.data.isTemporaryPassword) {
        alert("임시 비밀번호로 로그인했습니다. 비밀번호를 변경해주세요.");
        navigate("/change-password");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("로그인 실패:", err.response?.data);

      // 에러 발생 시 비밀번호 칸 비우기
      setPassword("");

      // 에러 메시지 표시
      setError(
        err.response?.data?.message ||
          "로그인에 실패했습니다. 다시 시도해주세요."
      );
    }
  };

  return (
    <div className="flex flex-col justify-evenly h-screen bg-white p-4">
      {/* 화면 상단: 로그인 제목 */}
      <div className="text-center">
        <h1 className="text-4xl font-bold">로그인</h1>
      </div>

      {/* 화면 중단: 입력 폼 및 비밀번호/회원가입 링크 */}
      <div className="flex flex-col items-center space-y-6">
        {/* 에러 메시지 */}
        {error && (
          <div className="text-red-500 text-sm font-medium">{error}</div>
        )}

        {/* 아이디 및 비밀번호 입력 */}
        <form className="w-full max-w-md space-y-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded border-black drop-shadow-lg focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded border-black drop-shadow-lg focus:outline-none focus:ring focus:ring-blue-300"
            required
          />

          {/* 비밀번호 찾기 및 회원가입 */}
          <div className="w-full flex items-center justify-between">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              비밀번호를 잊으셨나요?
            </Link>
            <Link
              to="/signup"
              className="text-sm font-black text-black hover:underline"
            >
              회원가입
            </Link>
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            className="w-full px-4 py-2 mt-4 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
};

export default BulLoginPage;
