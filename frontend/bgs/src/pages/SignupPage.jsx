import React, { useState } from "react";
import logo_image from "./../assets/logo_image.png";
import name_image from "./../assets/name.png";
import axios from "axios";

const SignupPage = ({ onNext }) => {
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
    setFormData({ ...formData, [name]: value });
  };

  const isPasswordValid = () => {
    const { password } = formData;
    return (
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*]/.test(password) &&
      password.length >= 10
    );
  };

  const handleSendEmail = async () => {
    try {
      setLoading(true);
      setError("");
      await axios.post("https://your-api-url.com/send-email", {
        email: formData.email,
      });
      setIsEmailSent(true);
      alert("인증번호가 발송되었습니다.");
    } catch (err) {
      setError(err.response?.data?.message || "이메일 발송에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      setLoading(true);
      setError("");
      await axios.post("https://your-api-url.com/verify-code", {
        email: formData.email,
        verificationCode: formData.verificationCode,
      });
      setIsVerified(true);
      alert("인증이 완료되었습니다.");
    } catch (err) {
      setError(err.response?.data?.message || "인증번호가 잘못되었습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isVerified && isPasswordValid()) {
      onNext({ email: formData.email, password: formData.password });
    } else {
      alert("모든 조건을 만족시켜주세요.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-evenly h-screen bg-white p-6">
      {/* 로고 */}
      <div className="flex items-center space-x-4">
        <img src={logo_image} alt="Logo" className="h-32" />
        <img src={name_image} alt="Name" className="h-15" />
      </div>

      <h2 className="text-2xl font-bold mb-4">회원가입</h2>

      <form className="space-y-4 w-full max-w-md" onSubmit={handleSubmit}>
        {/* 이메일 입력 */}
        <div className="flex items-center space-x-2">
          <input
            name="email"
            type="email"
            placeholder="이메일"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
          />
          <button
            type="button"
            onClick={handleSendEmail}
            className={`w-24 p-2 rounded ${
              formData.email
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={loading || !formData.email}
          >
            {loading ? "발송 중..." : "발송"}
          </button>
        </div>

        {/* 인증번호 입력 */}
        <div className="flex items-center space-x-2">
          <input
            name="verificationCode"
            placeholder="인증번호"
            value={formData.verificationCode}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
            disabled={!isEmailSent}
          />
          <button
            type="button"
            onClick={handleVerifyCode}
            className={`w-24 p-2 rounded ${
              formData.verificationCode
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!formData.verificationCode || isVerified}
          >
            인증
          </button>
        </div>

        {/* 비밀번호 입력 */}
        <input
          name="password"
          type="password"
          placeholder="비밀번호"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
        />
        <p className="text-gray-500 text-sm">
          - 대소문자, 숫자, 특수문자를 포함하고 10자리 이상으로 설정해주세요.
        </p>

        {/* 에러 메시지 */}
        {error && <p className="text-red-500">{error}</p>}

        {/* 계속하기 버튼 */}
        <button
          type="submit"
          className={`w-full p-3 rounded ${
            isVerified && isPasswordValid()
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!isVerified || !isPasswordValid()}
        >
          계속하기
        </button>
      </form>
    </div>
  );
};

export default SignupPage;
