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
  const [errors, setErrors] = useState({
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

  // userProfile이 존재하면 폼 초기값에 적용
  useEffect(() => {
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

  // 각 필드의 유효성을 검사하는 함수
  const validateField = (name, value) => {
    let errorMsg = "";
    if (name === "nickname") {
      if (!value.trim()) {
        errorMsg = "닉네임은 필수입니다.";
      } else if (value.trim().length < 3) {
        errorMsg = "닉네임은 최소 3글자 이상이어야 합니다.";
      }
    } else if (name === "name") {
      if (!value.trim()) {
        errorMsg = "이름은 필수입니다.";
      }
    } else if (name === "birthDate") {
      if (!value) {
        errorMsg = "생년월일을 선택해주세요.";
      }
    } else if (name === "sex") {
      if (!value) {
        errorMsg = "성별을 선택해주세요.";
      }
    } else if (name === "weight") {
      if (!value) {
        errorMsg = "몸무게는 필수입니다.";
      } else if (Number(value) <= 0) {
        errorMsg = "몸무게는 양수여야 합니다.";
      }
    } else if (name === "height") {
      if (value && Number(value) <= 0) {
        errorMsg = "키는 양수여야 합니다.";
      }
    }
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  // 모든 필드가 올바르게 입력되었는지 확인
  const isFormValid = () => {
    const { nickname, name, birthDate, sex, weight } = formData;
    // 필수 필드가 채워졌는지 체크
    if (!(nickname && name && birthDate && sex && weight)) {
      return false;
    }
    // 에러 메시지가 하나라도 있으면 false
    return (
      errors.nickname === "" &&
      errors.name === "" &&
      errors.birthDate === "" &&
      errors.sex === "" &&
      errors.weight === ""
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      setError("필수 항목을 모두 올바르게 입력해주세요.");
      return;
    }
    try {
      setLoading(true);
      // API 호출: 현재 로그인한 사용자의 추가 정보를 업데이트
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
      </button>
      {/* 로고 영역 */}
      <div className="flex flex-col items-center space-x-4 mb-10">
        <img src={logo_image} alt="Logo" className="h-32" />
        <img src={name_image} alt="Name" className="h-15" />
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">추가 정보 입력</h2>
      <form className="space-y-4 w-full max-w-md" onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            name="nickname"
            placeholder="닉네임"
            value={formData.nickname}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg text-base"
            required
          />
          {errors.nickname && <p className="text-red-500 text-sm">{errors.nickname}</p>}
        </div>
        <div>
          <input
            type="text"
            name="name"
            placeholder="이름"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg text-base"
            required
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>
        <div>
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg text-base"
            required
          />
          {errors.birthDate && <p className="text-red-500 text-sm">{errors.birthDate}</p>}
        </div>
        <div>
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
          {errors.sex && <p className="text-red-500 text-sm">{errors.sex}</p>}
        </div>
        <div>
          <input
            type="number"
            name="height"
            placeholder="키 (선택)"
            value={formData.height}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg text-base"
          />
          {errors.height && <p className="text-red-500 text-sm">{errors.height}</p>}
        </div>
        <div>
          <input
            type="number"
            name="weight"
            placeholder="몸무게"
            value={formData.weight}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg text-base"
            required
          />
          {errors.weight && <p className="text-red-500 text-sm">{errors.weight}</p>}
        </div>
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
