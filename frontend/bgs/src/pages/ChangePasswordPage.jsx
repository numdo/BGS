import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logoImage from "../assets/logo_image.png";
import nameImage from "../assets/name.png";

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 비밀번호 유효성 검사
  const isPasswordValid = () => {
    return (
      formData.newPassword.length >= 10 &&
      /[A-Z]/.test(formData.newPassword) && // 대문자 포함
      /[a-z]/.test(formData.newPassword) && // 소문자 포함
      /\d/.test(formData.newPassword) && // 숫자 포함
      /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) && // 특수문자 포함
      formData.newPassword === formData.confirmNewPassword
    );
  };

  // 비밀번호 변경 요청
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordValid()) {
      setError(
        "비밀번호는 10자 이상, 대소문자, 숫자, 특수문자를 포함해야 합니다."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const accessToken = localStorage.getItem("accessToken"); // 저장된 토큰 가져오기

      await axios.post(
        "https://i12c209.p.ssafy.io/api/users/change-password",
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmNewPassword: formData.confirmNewPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`, // 인증된 요청
          },
        }
      );

      alert("비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.");
      localStorage.removeItem("accessToken"); // 기존 토큰 삭제
      navigate("/login"); // 로그인 페이지로 이동
    } catch (err) {
      setError(err.response?.data || "비밀번호 변경 실패. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white px-10 py-16">
      {/* 페이지 상단: 로고 및 앱 이름 */}
      <div className="flex items-center justify-center space-x-8 mb-20">
        <img src={logoImage} alt="Logo" className="h-32" />
        <img src={nameImage} alt="App Name" className="h-15" />
      </div>

      {/* 제목 */}
      <h2 className="text-3xl font-bold text-gray-800 mb-14">비밀번호 변경</h2>

      {/* 비밀번호 변경 입력 폼 */}
      <form className="space-y-3 w-full max-w-md" onSubmit={handleSubmit}>
        {/* 현재 비밀번호 입력 */}
        <input
          type="password"
          name="currentPassword"
          placeholder="현재 비밀번호"
          value={formData.currentPassword}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg border-black drop-shadow-lg focus:ring focus:ring-blue-300 text-base"
          required
        />

        {/* 새 비밀번호 입력 */}
        <input
          type="password"
          name="newPassword"
          placeholder="새 비밀번호 (10자 이상)"
          value={formData.newPassword}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg border-black drop-shadow-lg focus:ring focus:ring-blue-300 text-base"
          required
        />

        {/* 새 비밀번호 확인 입력 */}
        <input
          type="password"
          name="confirmNewPassword"
          placeholder="새 비밀번호 확인"
          value={formData.confirmNewPassword}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg border-black drop-shadow-lg focus:ring focus:ring-blue-300 text-base"
          required
        />

        <p className="text-gray-500 text-sm">
          - 대소문자, 숫자, 특수문자를 포함하고 10자리 이상으로 설정해주세요.
        </p>

        {/* 오류 메시지 */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </form>

      {/* 비밀번호 변경 버튼 */}
      <div className="mt-16 w-full max-w-md">
        <button
          type="submit"
          onClick={handleSubmit}
          className={`w-full p-3 rounded-lg text-base font-semibold transition ${
            isPasswordValid()
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-white text-blue-500 border border-blue-500 cursor-not-allowed"
          }`}
          disabled={!isPasswordValid() || loading}
        >
          {loading ? "변경 중..." : "비밀번호 변경"}
        </button>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
