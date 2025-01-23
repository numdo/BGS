import React, { useState } from "react";

const UserDetails = () => {
  const [details, setDetails] = useState({
    height: "",
    weight: "",
    gender: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails({ ...details, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("사용자 정보:", details);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white p-6 rounded shadow-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">추가 정보 입력</h2>
        <input
          name="height"
          placeholder="키(cm)"
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-purple-300"
        />
        <input
          name="weight"
          placeholder="몸무게(kg)"
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-purple-300"
        />
        <select
          name="gender"
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-purple-300"
        >
          <option value="">성별 선택</option>
          <option value="male">남성</option>
          <option value="female">여성</option>
        </select>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          저장
        </button>
      </form>
    </div>
  );
};

export default UserDetails;
