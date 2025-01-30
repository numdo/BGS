import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://i12c209.p.ssafy.io/api/users/reset-password",
        { email },
        { headers: { "Content-Type": "application/json" } }
      );

      setMessage(
        response.data.message ||
          "비밀번호 재설정 링크가 이메일로 전송되었습니다."
      );
      setTimeout(() => navigate("/login"), 3000); // 3초 후 로그인 페이지로 이동
    } catch (err) {
      setError(
        err.response?.data || "비밀번호 재설정 요청 실패. 다시 시도해주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white p-6">
      <h2 className="text-2xl font-bold mb-4">비밀번호 찾기</h2>

      <form className="space-y-4 w-full max-w-md" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="이메일을 입력하세요"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
          required
        />

        {/* 에러 메시지 */}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-500 text-sm">{message}</p>}

        <button
          type="submit"
          className={`w-full p-3 rounded ${
            email && !loading
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!email || loading}
        >
          {loading ? "처리 중..." : "임시 비밀번호 발급"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
