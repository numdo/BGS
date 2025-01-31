import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo_image from "../assets/logo_image.png";
import name_image from "../assets/name.png";
import axios from "axios";

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
    const { password } = formData;
    return (
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*]/.test(password) &&
      password.length >= 10
    );
  };

  // 이메일 인증 코드 발송
  const handleSendEmail = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.post(
        "http://i12c209.p.ssafy.io/api/users/email-verification",
        null,
        {
          params: { email: formData.email },
        }
      );
      if (response.status === 200) {
        setIsEmailSent(true);
        alert("인증번호가 발송되었습니다.");
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setError("인증 코드 전송 중 오류가 발생했습니다.");
      } else {
        setError("CORS 오류 또는 네트워크 문제로 인해 요청이 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 인증 코드 확인
  const handleVerifyCode = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.post(
        "http://i12c209.p.ssafy.io/api/users/verify-code",
        null,
        {
          params: {
            email: formData.email,
            code: formData.verificationCode,
          },
        }
      );
      if (response.status === 200) {
        setIsVerified(true);
        alert("인증이 완료되었습니다.");
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setError("인증번호가 잘못되었습니다. 다시 확인해주세요.");
      } else {
        setError("인증 과정에서 문제가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 회원가입 1단계 완료 → 다음 페이지로 이동
  const handleSubmit = (e) => {
    e.preventDefault();
    // 이메일 인증 완료 & 비밀번호 유효성 검증
    if (isVerified && isPasswordValid()) {
      // 입력한 이메일, 비밀번호를 가지고 user-details 페이지로 이동
      navigate("/user-details", {
        state: { email: formData.email, password: formData.password },
      });
    } else {
      alert("모든 조건을 만족시켜주세요.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-evenly h-screen bg-white p-6">
      {/* 로고 영역 */}
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
                : "bg-white text-blue-500 border border-blue-500 cursor-not-allowed"
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
                : "bg-white text-blue-500 border border-blue-500 cursor-not-allowed"
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

        {/* 에러 메시지 표시 */}
        {error && <p className="text-red-500">{error}</p>}

        {/* 계속하기 버튼 */}
        <button
          type="submit"
          className={`w-full p-3 rounded ${
            isVerified && isPasswordValid()
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-white text-blue-500 border border-blue-500 cursor-not-allowed"
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
