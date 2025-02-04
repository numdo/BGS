import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SocialSignupPage = () => {
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken"); // ✅ 로그인 토큰 가져오기

  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    birthDate: "",
    sex: "", // 🔹 기본값 설정 (null 방지)
    height: "",
    weight: "",
  });

  useEffect(() => {
    console.log("🔹 현재 formData:", formData);
  }, [formData]); // 값 변경될 때마다 출력

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!accessToken) {
      alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.patch(
        `https://i12c209.p.ssafy.io/api/users/me/social-signup`,
        {
          ...formData,
          sex: formData.sex ? formData.sex.toUpperCase() : "", // ✅ 성별 변환 안정화
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`, // ✅ 인증 헤더 추가
          },
        }
      );

      console.log("✅ 회원가입 성공:", response.data);

      // ✅ 회원가입 완료 후 메인 페이지로 이동
      navigate("/");
    } catch (error) {
      console.error("❌ 회원가입 실패:", error);
      alert("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white p-4">
      <h2 className="text-2xl font-bold mb-4">소셜 회원가입</h2>
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
          <option value="M">남성</option>
          <option value="F">여성</option>
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

export default SocialSignupPage;
