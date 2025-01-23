import React, { useState } from "react";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    id: "",
    password: "",
    email: "",
    name: "",
    nickname: "",
    birthdate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("회원가입 정보:", formData);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white p-6 rounded shadow-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">회원가입</h2>
        <input
          name="id"
          placeholder="아이디"
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-green-300"
        />
        <input
          name="password"
          type="password"
          placeholder="비밀번호"
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-green-300"
        />
        <input
          name="email"
          type="email"
          placeholder="이메일"
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-green-300"
        />
        <input
          name="name"
          placeholder="이름"
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-green-300"
        />
        <input
          name="nickname"
          placeholder="닉네임"
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-green-300"
        />
        <input
          name="birthdate"
          type="date"
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-green-300"
        />
        <button
          type="submit"
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          회원가입
        </button>
      </form>
    </div>
  );
};

export default SignupPage;
