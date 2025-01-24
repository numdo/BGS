import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // useNavigate 추가
import logo_image from "./../assets/logo_image.png";
import name_image from "./../assets/name.png";
import axios from "axios"; // axios 추가

const UserDetailsPage = ({ email, password }) => {
  const [details, setDetails] = useState({
    name: "",
    nickname: "",
    birthdate: "",
    height: "",
    weight: "",
    gender: "",
  });
  const navigate = useNavigate(); // useNavigate 훅 사용

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails({ ...details, [name]: value });
  };

  const isFormComplete = () => {
    return Object.values(details).every((value) => value.trim() !== "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 서버에 회원가입 데이터 전송
      await axios.post("https://your-api-url.com/signup-complete", {
        email,
        password,
        ...details,
      });
      alert("회원가입이 완료되었습니다!");

      // 회원가입 성공 후 '/'로 이동
      navigate("/");
    } catch (err) {
      alert(
        "회원가입 실패: " + (err.response?.data?.message || "알 수 없는 오류")
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-evenly h-screen bg-white p-6">
      {/* 로고 */}
      <div className="flex items-center space-x-4">
        <img src={logo_image} alt="Logo" className="h-32" />
        <img src={name_image} alt="Name" className="h-15" />
      </div>

      <h2 className="text-2xl font-bold mb-4">사용자 정보 입력</h2>

      <form className="space-y-4 w-full max-w-md" onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="이름"
          value={details.name}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
        />
        <input
          name="nickname"
          placeholder="닉네임"
          value={details.nickname}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
        />
        <input
          name="birthdate"
          type="date"
          value={details.birthdate}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
        />
        <input
          name="height"
          type="number"
          placeholder="키(cm)"
          value={details.height}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
        />
        <input
          name="weight"
          type="number"
          placeholder="몸무게(kg)"
          value={details.weight}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
        />
        <select
          name="gender"
          value={details.gender}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
        >
          <option value="">성별 선택</option>
          <option value="male">남성</option>
          <option value="female">여성</option>
        </select>
      </form>

      {/* 시작하기 버튼을 form 밖으로 꺼냄 */}
      <button
        type="button"
        onClick={handleSubmit}
        className={`w-full p-3 rounded mt-4 ${
          isFormComplete()
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-white text-blue-500 border-blue-500 cursor-not-allowed"
        } ${!isFormComplete() ? "border-2" : ""}`}
        disabled={!isFormComplete()}
      >
        시작하기
      </button>
    </div>
  );
};

export default UserDetailsPage;
