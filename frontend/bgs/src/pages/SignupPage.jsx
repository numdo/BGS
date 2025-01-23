import React, { useState } from "react";
import logo_image from "./../assets/logo_image.png";
import name from "./../assets/name.png";
import axios from "axios";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    verificationCode: "",
  });

  const [error, setError] = useState(""); // 에러 메시지 상태
  const [loading, setLoading] = useState(false); // 로딩 상태

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 로딩 상태 시작
    setLoading(true);
    setError(""); // 에러 초기화

    try {
      const response = await axios.post(
        "https://your-api-url.com/signup",
        formData
      );
      console.log("회원가입 성공:", response.data);
    } catch (err) {
      console.error("회원가입 실패:", err);
      setError(err.response?.data?.message || "회원가입에 실패했습니다.");
    } finally {
      setLoading(false); // 로딩 상태 종료
    }
  };

  return (
    <div className="flex flex-col items-center justify-evenly h-screen bg-white p-6">
      {/* 상단 로고 및 이름 */}
      <div className="flex items-center justify-center w-full space-x-4 mb-1">
        <img src={logo_image} alt="Logo" className="h-24" />{" "}
        {/* 로고 크기 증가 */}
        <img src={name} alt="Name" className="h-12" /> {/* 이름 크기 감소 */}
      </div>

      {/* 회원가입 제목 */}
      <h2 className="text-4xl font-bold text-center mb-1">회원가입</h2>

      {/* 회원가입 폼 */}
      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4">
        {/* 이메일 입력 및 인증 버튼 */}
        <div className="flex items-center space-x-4">
          <input
            name="email"
            type="email"
            placeholder="이메일 주소"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
          />
          <button
            type="button"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center whitespace-nowrap"
            onClick={() => console.log("인증 버튼 클릭")}
          >
            인증
          </button>
        </div>

        {/* 인증번호 입력 */}
        <div className="flex items-center space-x-4">
          <input
            name="verificationCode"
            placeholder="인증번호"
            value={formData.verificationCode}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
          />
          <button
            type="button"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center whitespace-nowrap"
            onClick={() => console.log("제출 버튼 클릭")}
          >
            제출
          </button>
        </div>

        {/* 비밀번호 입력 */}
        <input
          name="password"
          type="password"
          placeholder="비밀번호"
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
        />

        {/* 에러 메시지 */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </form>

      {/* 회원가입 버튼 */}
      <div className="w-full max-w-lg mt-20">
        {loading ? (
          <button
            type="button"
            className="w-full px-4 py-3 bg-gray-300 text-white rounded cursor-not-allowed"
            disabled
          >
            로딩 중...
          </button>
        ) : (
          <button
            onClick={handleSubmit} // `form`의 기본 제출 동작을 대체
            className="w-full px-4 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            회원가입
          </button>
        )}
      </div>
    </div>
  );
};

export default SignupPage;
