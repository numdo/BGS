// src/pages/SocialSignupPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socialSignup } from "../../api/Auth"; // Social signup API 함수
import { getUser } from "../../api/User"; // 현재 사용자 정보를 조회하는 API 함수 (예시)
import { ArrowLeft } from "lucide-react";
import logo_image from "../../assets/images/logo_image.png";
import name_image from "../../assets/images/name.png";

const SocialSignupPage = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [formData, setFormData] = useState({
    nickname: "",
    name: "",
    birthDate: "",
    sex: "",
    height: "",
    weight: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 현재 로그인한 사용자 정보 조회 (필요한 추가 정보가 있는지 확인)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUser();
        setUserProfile(data);
        // 이미 프로필이 완성되었다면 메인 페이지로 이동
        if (data.nickname && data.name && data.birthDate && data.sex && data.weight) {
          navigate("/");
        }
      } catch (err) {
        console.error("사용자 정보 조회 실패", err);
      }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    // 초기 로드 시, userProfile이 있으면 폼 초기값에 적용
    if (userProfile) {
      setFormData({
        nickname: userProfile.nickname || "",
        name: userProfile.name || "",
        birthDate: userProfile.birthDate || "",
        sex: userProfile.sex || "",
        height: userProfile.height || "",
        weight: userProfile.weight || "",
      });
    }
  }, [userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 예시: 필수 항목(닉네임, 이름, 생년월일, 성별, 몸무게)이 모두 입력되었는지 확인
  const isFormValid = () => {
    const { nickname, name, birthDate, sex, weight } = formData;
    return nickname && name && birthDate && sex && weight;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      setError("필수 항목을 모두 입력해주세요.");
      return;
    }
    try {
      setLoading(true);
      // API 호출: 현재 로그인한 사용자(userProfile.userId 또는 authentication token 기반)
      await socialSignup(formData);
      alert("추가 회원가입이 완료되었습니다.");
      navigate("/");
    } catch (err) {
      setError(err.response?.data || "회원가입 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-10 py-16">
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
      <h2 className="text-3xl font-bold text-gray-800 mb-6">추가 정보 입력</h2>
      <form className="space-y-4 w-full max-w-md" onSubmit={handleSubmit}>
        <input
          type="text"
          name="nickname"
          placeholder="닉네임"
          value={formData.nickname}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg text-base"
          required
        />
        <input
          type="text"
          name="name"
          placeholder="이름"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg text-base"
          required
        />
        <input
          type="date"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg text-base"
          required
        />
        <select
          name="sex"
          value={formData.sex}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg text-base"
          required
        >
          <option value="">성별 선택</option>
          <option value="M">남성</option>
          <option value="F">여성</option>
        </select>
        <input
          type="number"
          name="height"
          placeholder="키 (선택)"
          value={formData.height}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg text-base"
        />
        <input
          type="number"
          name="weight"
          placeholder="몸무게"
          value={formData.weight}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg text-base"
          required
        />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading || !isFormValid()}
          className={`w-full p-3 rounded-lg text-base font-semibold transition ${
            loading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {loading ? "처리 중..." : "회원가입 완료"}
        </button>
      </form>
    </div>
  );
};

export default SocialSignupPage;
