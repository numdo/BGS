import React, { useState } from "react";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      <input
        type="password"
        name="confirmPassword"
        placeholder="비밀번호 확인"
        value={formData.confirmPassword}
        onChange={handleChange}
        className="w-full p-3 border rounded-lg text-base"
        required
      />
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
      <p className="text-gray-500 text-sm text-center">
        비밀번호는 10자 이상이어야 하며, 영문, 숫자, 특수문자를 포함해야 합니다.
      </p>
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
