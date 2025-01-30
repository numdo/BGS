import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
      formData.newPassword.length >= 8 && // 8자 이상
      formData.newPassword === formData.confirmNewPassword // 새 비밀번호 일치 확인
    );
  };

  // 비밀번호 변경 요청
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordValid()) {
      setError(
        "비밀번호가 8자 이상이어야 하며, 새 비밀번호가 일치해야 합니다."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const accessToken = localStorage.getItem("accessToken"); // 저장된 토큰 가져오기

      const response = await axios.post(
        "http://i12c209.p.ssafy.io/api/users/change-password",
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
    <div className="flex flex-col items-center justify-center h-screen bg-white p-6">
      <h2 className="text-2xl font-bold mb-4">비밀번호 변경</h2>

      <form className="space-y-4 w-full max-w-md" onSubmit={handleSubmit}>
        {/* 현재 비밀번호 입력 */}
        <input
          type="password"
          name="currentPassword"
          placeholder="현재 비밀번호"
          value={formData.currentPassword}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
          required
        />

        {/* 새 비밀번호 입력 */}
        <input
          type="password"
          name="newPassword"
          placeholder="새 비밀번호"
          value={formData.newPassword}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
          required
        />

        {/* 새 비밀번호 확인 입력 */}
        <input
          type="password"
          name="confirmNewPassword"
          placeholder="새 비밀번호 확인"
          value={formData.confirmNewPassword}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
          required
        />

        {/* 오류 메시지 */}
        {error && <p className="text-red-500">{error}</p>}

        {/* 비밀번호 변경 버튼 */}
        <button
          type="submit"
          className={`w-full p-3 rounded ${
            isPasswordValid()
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!isPasswordValid() || loading}
        >
          {loading ? "변경 중..." : "비밀번호 변경"}
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordPage;
