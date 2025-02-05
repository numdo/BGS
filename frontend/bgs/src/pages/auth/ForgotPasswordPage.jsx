import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logoImage from "../../assets/images/logo_image.png";
import nameImage from "../../assets/images/name.png";

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
        "https://i12c209.p.ssafy.io/api/users/reset-password",
        { email },
        { headers: { "Content-Type": "application/json" } }
      );

      setMessage(
        response.data.message ||
        "비밀번호 재설정 링크가 이메일로 전송되었습니다."
      );
      setTimeout(() => navigate("/login"), 10000); // 10초 후 로그인 페이지로 이동
    } catch (err) {
      if (err.response?.status === 400) {
        setError("등록되지 않은 이메일입니다.");
      } else {
        setError(
          err.response?.data?.message ||
          "비밀번호 재설정 요청 실패. 다시 시도해주세요."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white px-10 py-24">
      {/* ✅ 페이지 상단: 로고 & 앱 이름 (가로 배치) */}
      <div className="flex flex-row items-center space-x-6 mb-16">
        <img src={logoImage} alt="Logo" className="w-28 h-28" />
        <img src={nameImage} alt="App Name" className="h-16" />
      </div>

      {/* ✅ 제목 */}
      <h2 className="text-4xl font-bold text-gray-800 mb-6">
        임시 비밀번호 발급
      </h2>

      {/* ✅ 안내 문구 */}
      <p className="text-gray-500 text-sm mb-12 text-center">
        기존에 가입하신 이메일을 입력하시면, <br />
        임시 비밀번호를 메일로 발송해드립니다.
      </p>

      {/* ✅ 비밀번호 찾기 폼 */}
      <form className="space-y-6 w-full max-w-md" onSubmit={handleSubmit}>
        {/* 이메일 입력 */}
        <input
          type="email"
          placeholder="이메일을 입력하세요"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 border rounded-lg focus:ring focus:ring-blue-300 text-lg"
          required
        />
      </form>

      {/* ✅ 임시 비밀번호 발급 버튼 */}
      <div className="mt-12 w-full max-w-md">
        <button
          type="submit"
          onClick={handleSubmit}
          className={`w-full p-4 rounded-lg text-lg font-semibold transition ${email && !loading
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-white text-blue-500 border border-blue-500 cursor-not-allowed"
            }`}
          disabled={!email || loading}
        >
          {loading ? "처리 중..." : "임시 비밀번호 발급"}
        </button>
      </div>

      {/* ✅ 에러 메시지 또는 성공 메시지 */}
      <div className="mt-8 w-full max-w-md text-center">
        {error && <p className="text-red-500 text-lg">{error}</p>}
        {message && <p className="text-green-500 text-lg">{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
