import { useState } from "react";
import { checkNickname } from "../../api/Auth"; // 닉네임 체크 API 임포트

const SignupForm = ({ email, onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    email: email, // 이미 인증된 이메일
    password: "",
    confirmPassword: "",
    nickname: "",
    name: "",
    birthDate: "",
    sex: "",
    height: "",
    weight: "",
  });

  // 닉네임 상태: "available" (사용 가능), "unavailable" (사용 중) 또는 null (아직 체크 안됨)
  const [nicknameStatus, setNicknameStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // 닉네임 입력이 변경되면 이전 체크 결과 초기화
    if (name === "nickname") {
      setNicknameStatus(null);
    }
  };

  // 비밀번호 유효성 검사: 10자 이상, 영문(대소문자 포함), 숫자, 특수문자 포함
  const isPasswordValid = () => {
    const { password } = formData;
    return (
      password.length >= 10 &&
      /[A-Za-z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    );
  };

  // 닉네임 중복 체크 함수
  const handleNicknameCheck = async () => {
    if (!formData.nickname.trim()) {
      alert("닉네임을 입력해 주세요.");
      return;
    }
    try {
      const result = await checkNickname(formData.nickname);
      // API 응답으로 { available: true/false } 형태라고 가정합니다.
      if (result.available) {
        setNicknameStatus("available");
        alert("닉네임 사용 가능합니다.");
      } else {
        setNicknameStatus("unavailable");
        alert("이미 사용 중인 닉네임입니다.");
      }
    } catch (error) {
      console.error("닉네임 체크 중 오류 발생", error);
      alert("닉네임 체크 중 오류 발생.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호와 확인이 일치하지 않습니다.");
      return;
    }
    if (!isPasswordValid()) {
      alert("비밀번호 조건을 만족하지 않습니다.");
      return;
    }
    if (nicknameStatus !== "available") {
      alert("닉네임 중복 체크를 완료해 주세요.");
      return;
    }
    // SignupRequestDto에 맞게 confirmPassword 제외
    const { confirmPassword, ...signupData } = formData;
    onSubmit(signupData);
  };

  return (
    <form className="space-y-4 w-full max-w-md" onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        value={formData.email}
        readOnly
        className="w-full p-3 border rounded-lg bg-gray-100 text-base"
      />
      <input
        type="password"
        name="password"
        placeholder="비밀번호"
        value={formData.password}
        onChange={handleChange}
        className="w-full p-3 border rounded-lg text-base"
        required
      />
      {/* 비밀번호 유효성 검사 메시지 */}
      {formData.password && !isPasswordValid() && (
        <p className="text-red-500 text-sm">
          비밀번호는 10자 이상이며, 영문, 숫자, 특수문자를 포함해야 합니다.
        </p>
      )}
      <input
        type="password"
        name="confirmPassword"
        placeholder="비밀번호 확인"
        value={formData.confirmPassword}
        onChange={handleChange}
        className="w-full p-3 border rounded-lg text-base"
        required
      />
      {/* 비밀번호 일치 여부 검사 메시지 */}
      {formData.confirmPassword &&
        formData.password !== formData.confirmPassword && (
          <p className="text-red-500 text-sm">비밀번호가 일치하지 않습니다.</p>
        )}
      {/* 닉네임 입력 및 중복 체크 */}
      <div className="flex flex-col space-y-2">
        <div className="flex space-x-2">
          <input
            type="text"
            name="nickname"
            placeholder="닉네임"
            value={formData.nickname}
            onChange={handleChange}
            className="flex-grow p-3 border rounded-lg text-base"
            required
          />
          <button
            type="button"
            onClick={handleNicknameCheck}
            className="p-3 border rounded-lg text-base bg-green-500 text-white hover:bg-green-600"
          >
            중복 체크
          </button>
        </div>
        {nicknameStatus === "available" && (
          <p className="text-green-500 text-sm">사용 가능한 닉네임입니다.</p>
        )}
        {nicknameStatus === "unavailable" && (
          <p className="text-red-500 text-sm">이미 사용 중인 닉네임입니다.</p>
        )}
      </div>
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
        placeholder="키 (cm)"
        value={formData.height}
        onChange={handleChange}
        className="w-full p-3 border rounded-lg text-base"
        required
      />
      <input
        type="number"
        name="weight"
        placeholder="몸무게 (kg)"
        value={formData.weight}
        onChange={handleChange}
        className="w-full p-3 border rounded-lg text-base"
        required
      />

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <button
        type="submit"
        disabled={loading || !isPasswordValid()}
        className={`w-full p-3 rounded-lg text-base font-semibold transition ${
          loading
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        회원가입
      </button>
    </form>
  );
};

export default SignupForm;
