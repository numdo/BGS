import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const KakaoSignupPage = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    birthDate: "",
    sex: "",
    height: "",
    weight: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `https://i12c209.p.ssafy.io/api/users/${userId}/kakao-signup`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("회원가입 성공:", response.data);

      // ✅ 회원가입 완료 후 메인 페이지로 이동
      navigate("/");
    } catch (error) {
      console.error("회원가입 실패:", error);
      alert("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white p-4">
      <h2 className="text-2xl font-bold mb-4">카카오 회원가입</h2>
      <form className="w-full max-w-md space-y-4" onSubmit={handleSignup}>
        <input
          type="text"
          name="name"
          placeholder="이름"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="text"
          name="nickname"
          placeholder="닉네임"
          value={formData.nickname}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="date"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded"
        />
        <select
          name="sex"
          value={formData.sex}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded"
        >
          <option value="">성별 선택</option>
          <option value="남성">남성</option>
          <option value="여성">여성</option>
        </select>
        <input
          type="number"
          name="height"
          placeholder="키(cm)"
          value={formData.height}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="number"
          name="weight"
          placeholder="몸무게(kg)"
          value={formData.weight}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          회원가입 완료
        </button>
      </form>
    </div>
  );
};

export default KakaoSignupPage;
