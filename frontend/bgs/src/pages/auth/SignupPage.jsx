import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendEmailVerify, receiveEmailVerify } from "../../api/Auth"; // ✅ API 함수 불러오기
import { ArrowLeft } from "lucide-react";
import logo_image from "../../assets/images/logo_image.png";
import name_image from "../../assets/images/name.png";

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    verificationCode: "",
  });
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isPasswordValid = () => {
    return (
      /[a-z]/.test(formData.password) &&
      /[A-Z]/.test(formData.password) &&
      /\d/.test(formData.password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) &&
      formData.password.length >= 10
    );
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white px-10 py-16">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-5 left-5 text-black font-medium p-2 rounded hover:bg-gray-100 flex items-center space-x-2"
      >
        <ArrowLeft size={20} />
        <span>뒤로가기</span>
      </button>

      {/* 로고 영역 */}
      <div className="flex items-center space-x-4 mb-10">
        <img src={logo_image} alt="Logo" className="h-32" />
        <img src={name_image} alt="Name" className="h-15" />
      </div>

      <h2 className="text-3xl font-bold text-gray-800 mb-6">회원가입</h2>

      {/* 이메일 입력 및 인증 */}
      <form className="space-y-3 w-full max-w-md">
        <div className="flex items-center space-x-2">
          <input
            name="email"
            type="email"
            placeholder="이메일"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg border-black drop-shadow-lg focus:ring focus:ring-blue-300 text-base"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            name="verificationCode"
            placeholder="인증번호"
            value={formData.verificationCode}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg border-black drop-shadow-lg focus:ring focus:ring-blue-300 text-base"
            disabled={!isEmailSent}
          />
        </div>

        {/* 비밀번호 입력 */}
        <input
          name="password"
          type="password"
          placeholder="비밀번호"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg border-black drop-shadow-lg focus:ring focus:ring-blue-300 text-base"
        />
        <p className="text-gray-500 text-sm mb-6 text-center">
          새로운 비밀번호는 10자 이상이어야 하며, 대문자, 소문자, 숫자,
          특수문자를 포함해야 합니다.
        </p>

        {/* 오류 메시지 */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {/* 회원가입 버튼 */}
        <div className="mt-16 w-full max-w-md">
          <button
            type="submit"
            className={`w-full p-3 rounded-lg text-base font-semibold transition ${
              isVerified && isPasswordValid()
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-white text-blue-500 border border-blue-500 cursor-not-allowed"
            }`}
            disabled={!isVerified || !isPasswordValid()}
          >
            회원가입
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignupPage;
