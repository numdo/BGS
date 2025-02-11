import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signup } from "../../api/Auth"; // ✅ API 함수 불러오기
import logo_image from "../../assets/images/logo_image.png";
import name_image from "../../assets/images/name.png";

const UserDetailsPage = () => {
  // useLocation을 통해 SignupPage에서 전달된 state(email, password)를 가져옴
  const location = useLocation();
  const { email, password } = location.state || { email: "", password: "" };

  const [details, setDetails] = useState({
    name: "",
    nickname: "",
    birthDate: "",
    height: "",
    weight: "",
    sex: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails((prev) => ({ ...prev, [name]: value }));
  };

  const isFormComplete = () => {
    return Object.values(details).every((value) => value.trim() !== "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ 회원가입 완료 정보를 서버로 전송 (API 함수 사용)
      await signup({
        email,
        password,
        ...details,
      });

      alert("회원가입이 완료되었습니다!");

      // ✅ 회원가입 성공 후 메인 페이지로 이동
      navigate("/");
    } catch (err) {
      alert(
        "회원가입 실패: " +
          (err.response?.data?.message || "알 수 없는 오류가 발생했습니다.")
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
          name="birthDate"
          type="date"
          value={details.birthDate}
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
          name="sex"
          value={details.sex}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
        >
          <option value="">성별 선택</option>
          <option value="M">남성</option>
          <option value="F">여성</option>
        </select>

        {/* 제출 버튼 */}
        <button
          type="submit"
          className={`w-full p-3 rounded mt-4 ${
            isFormComplete()
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-white text-blue-500 border border-blue-500 cursor-not-allowed"
          }`}
          disabled={!isFormComplete()}
        >
          가입 완료
        </button>
      </form>
    </div>
  );
};

export default UserDetailsPage;
