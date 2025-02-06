import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../api/Auth";
import { ArrowLeft } from "lucide-react";
import logoImage from "../../assets/images/logo_image.png";
import nameImage from "../../assets/images/name.png";

const BulLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ 새로고침/재접속 시 자동 로그인
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await login({ email, password });

      // ✅ 로그인 정보 저장 (accessToken & refreshToken)
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);

      // ✅ 임시 비밀번호 여부 확인 후 비밀번호 변경 페이지로 이동
      if (response.isTemporaryPassword) {
        alert("임시 비밀번호로 로그인했습니다. 비밀번호를 변경해주세요.");
        navigate("/change-password");
      } else {
        navigate("/");
      }
    } catch (err) {
      setPassword("");
      setError(
        err.response?.data?.message ||
          "로그인에 실패했습니다. 다시 시도해주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white px-10 py-16">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-5 left-5 text-black font-medium p-2 rounded hover:bg-gray-100 flex items-center space-x-2"
      >
        <ArrowLeft size={20} />
        <span>뒤로가기</span>
      </button>

      {/* 페이지 상단: 로고 및 앱 이름 */}
      <div className="flex items-center justify-center space-x-8 mb-20">
        <img src={logoImage} alt="Logo" className="h-32" />
        <img src={nameImage} alt="App Name" className="h-15" />
      </div>

      {/* 제목 */}
      <h2 className="text-3xl font-bold text-gray-800 mb-14">로그인</h2>

      {/* 로그인 입력 폼 */}
      <form className="space-y-3 w-full max-w-md" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded-lg border-black drop-shadow-lg focus:ring focus:ring-blue-300 text-base"
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded-lg border-black drop-shadow-lg focus:ring focus:ring-blue-300 text-base"
          required
        />

        {/* 오류 메시지 */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {/* 비밀번호 찾기 및 회원가입 */}
        <div className="w-full flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="text-blue-600 hover:underline">
            비밀번호를 잊으셨나요?
          </Link>
          <Link to="/signup" className="font-bold text-black hover:underline">
            회원가입
          </Link>
        </div>
      </form>

      {/* 로그인 버튼 */}
      <div className="mt-16 w-full max-w-md">
        <button
          type="submit"
          onClick={handleLogin}
          className={`w-full p-3 rounded-lg text-base font-semibold transition ${
            loading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
          disabled={loading}
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </div>
    </div>
  );
};

export default BulLoginPage;
