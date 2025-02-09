// src/components/auth/SocialSignupForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socialSignup } from "../../api/Auth";
import { checkNickname } from "../../api/User";
import { getUser } from "../../api/User"; // 가입 후 프로필 재확인
import { ArrowLeft } from "lucide-react";
import logo_image from "../../assets/images/logo_image.png";
import name_image from "../../assets/images/name.png";

// 헬퍼: 생년월일 범위 검사 (1900-01-01 ~ 오늘 이하)
function validateBirthDate(value) {
  if (!value) return "생년월일을 선택해주세요.";
  const [yyyy, mm, dd] = value.split("-").map(Number);
  if (!yyyy || !mm || !dd) return "생년월일 형식이 잘못되었습니다.";
  if (yyyy < 1900) return "생년월일은 1900년 이후여야 합니다.";

  const birth = new Date(yyyy, mm - 1, dd);
  const today = new Date();
  if (birth > today) {
    return "생년월일이 오늘보다 미래일 수 없습니다.";
  }
  return ""; // 에러 없음
}

const SocialSignupForm = ({ userProfile }) => {
  const navigate = useNavigate();

  // 초기 폼 상태
  const [formData, setFormData] = useState({
    nickname: "",
    name: "",
    birthDate: "",
    sex: "",
    height: "",
    weight: "",
  });

  // 각 필드별 에러
  const [errors, setErrors] = useState({
    nickname: "",
    name: "",
    birthDate: "",
    sex: "",
    height: "",
    weight: "",
  });

  // 닉네임 상태: "available" | "unavailable" | "checking" | null
  const [nicknameStatus, setNicknameStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // userProfile 바뀔 때마다 폼 초기값 세팅
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

  // 필드 유효성 검사 (변경된 요구 사항 반영)
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
      // 별도 함수로 검사
      errorMsg = validateBirthDate(value);
    } else if (name === "sex") {
      if (!value) {
        errorMsg = "성별을 선택해주세요.";
      }
    } else if (name === "height") {
      // 50 이상 1000 이하
      if (value) {
        const h = Number(value);
        if (h < 50 || h > 1000) {
          errorMsg = "키는 50 이상 1000 이하여야 합니다.";
        }
      }
    } else if (name === "weight") {
      // 1 이상 1000 이하
      if (!value) {
        errorMsg = "몸무게는 필수입니다.";
      } else {
        const w = Number(value);
        if (w < 1 || w > 1000) {
          errorMsg = "몸무게는 1 이상 1000 이하여야 합니다.";
        }
      }
    }

    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  // input 변경 시
  const handleChange = (e) => {
    const { name, value } = e.target;

    // 닉네임이 바뀌면 중복체크 결과 초기화
    if (name === "nickname") {
      setNicknameStatus(null);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  // 닉네임 중복 체크
  const handleNicknameCheck = async () => {
    const nickname = formData.nickname.trim();
    if (!nickname) {
      setErrors((prev) => ({ ...prev, nickname: "닉네임을 입력해주세요." }));
      return;
    }
    setNicknameStatus("checking");
    try {
      const result = await checkNickname(nickname);
      console.log("[SocialSignupForm] checkNickname result:", result);
      if (result.available) {
        setNicknameStatus("available");
        setErrors((prev) => ({ ...prev, nickname: "" }));
        alert("사용 가능한 닉네임입니다.");
      } else {
        setNicknameStatus("unavailable");
        setErrors((prev) => ({
          ...prev,
          nickname: "이미 사용 중인 닉네임입니다.",
        }));
        alert("이미 사용 중인 닉네임입니다.");
      }
    } catch (e) {
      console.error("[SocialSignupForm] 닉네임 중복 체크 실패:", e);
      setNicknameStatus("error");
      setErrors((prev) => ({
        ...prev,
        nickname: "닉네임 중복 체크에 실패했습니다.",
      }));
    }
  };

  // 폼 전체 유효성 검사
  const isFormValid = () => {
    const { nickname, name, birthDate, sex, weight } = formData;

    // 필수 항목 확인
    if (!(nickname && name && birthDate && sex && weight)) return false;

    // 닉네임 중복 체크는 "available" 상태여야 함
    if (nicknameStatus !== "available") return false;

    // 에러 메시지가 하나라도 있으면 false
    return Object.values(errors).every((msg) => msg === "");
  };

  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[SocialSignupForm] 제출된 formData:", formData);

    if (!isFormValid()) {
      setError("필수 항목을 모두 올바르게 입력해주세요.");
      console.log("[SocialSignupForm] 폼 검증 실패. errors:", errors);
      return;
    }

    try {
      setLoading(true);
      // 1) 서버에 추가 회원가입(추가정보) 요청
      await socialSignup(formData);
      console.log("[SocialSignupForm] socialSignup 성공");

      // 2) 가입 직후, 실제 DB에 반영되었는지 다시 getUser()로 확인
      const updatedUser = await getUser();
      console.log("[SocialSignupForm] 가입 후 다시 가져온 user:", updatedUser);

      // 3) 업데이트된 user에 필수 정보가 제대로 들어갔는지 확인(디버깅)
      if (
        updatedUser.nickname &&
        updatedUser.name &&
        updatedUser.birthDate &&
        updatedUser.sex &&
        updatedUser.weight
      ) {
        alert("추가 회원가입이 완료되었습니다.");
        navigate("/");
      } else {
        // 혹시라도 다시 불완전할 경우, 에러로그
        alert(
          "회원정보가 제대로 저장되지 않았습니다. 다시 시도해 주세요.\n" +
            JSON.stringify(updatedUser)
        );
      }
    } catch (err) {
      console.error("[SocialSignupForm] 소셜 회원가입 중 오류:", err);
      setError(err.response?.data || "회원가입 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-8 w-full max-w-md relative">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 text-gray-600 hover:text-gray-800"
      >
        <ArrowLeft size={24} />
      </button>

      {/* 로고 영역 */}
      <div className="flex flex-col items-center mb-8">
        <img src={logo_image} alt="Logo" className="h-20 mb-4" />
        <img src={name_image} alt="Name" className="h-10" />
      </div>

      {/* 폼 */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* 닉네임 + 중복 체크 */}
        <div className="flex flex-col">
          <div className="flex">
            <input
              type="text"
              name="nickname"
              placeholder="닉네임"
              value={formData.nickname}
              onChange={handleChange}
              className="flex-grow appearance-none rounded-l-md px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
            <button
              type="button"
              onClick={handleNicknameCheck}
              className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none"
            >
              확인
            </button>
          </div>
          {errors.nickname && (
            <p className="text-red-500 text-sm mt-1">{errors.nickname}</p>
          )}
          {nicknameStatus === "available" && (
            <p className="text-green-600 text-sm mt-1">
              사용 가능한 닉네임입니다.
            </p>
          )}
        </div>

        {/* 이름 */}
        <div>
          <input
            type="text"
            name="name"
            placeholder="이름"
            value={formData.name}
            onChange={handleChange}
            className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500
                       text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* 생년월일 */}
        <div>
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 text-gray-900
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
          {errors.birthDate && (
            <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>
          )}
        </div>

        {/* 성별 */}
        <div>
          <select
            name="sex"
            value={formData.sex}
            onChange={handleChange}
            className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          >
            <option value="">성별 선택</option>
            <option value="M">남성</option>
            <option value="F">여성</option>
          </select>
          {errors.sex && (
            <p className="text-red-500 text-sm mt-1">{errors.sex}</p>
          )}
        </div>

        {/* 키 */}
        <div>
          <input
            type="number"
            name="height"
            placeholder="키"
            value={formData.height}
            onChange={handleChange}
            className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500
                       text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.height && (
            <p className="text-red-500 text-sm mt-1">{errors.height}</p>
          )}
        </div>

        {/* 몸무게 */}
        <div>
          <input
            type="number"
            name="weight"
            placeholder="몸무게"
            value={formData.weight}
            onChange={handleChange}
            className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500
                       text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
          {errors.weight && (
            <p className="text-red-500 text-sm mt-1">{errors.weight}</p>
          )}
        </div>

        {/* 상단 오류 외 공통 에러 메시지 */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={loading || !isFormValid()}
          className={`w-full py-2 rounded-md text-base font-semibold transition ${
            loading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {loading ? "처리 중..." : "회원가입 완료"}
        </button>
      </form>
    </div>
  );
};

export default SocialSignupForm;
