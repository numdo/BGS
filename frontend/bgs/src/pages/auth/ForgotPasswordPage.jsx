import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../../api/Auth"; // ✅ API 함수 불러오기
import { ChevronLeftIcon } from "@heroicons/react/24/solid";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await resetPassword(email); // ✅ API 함수 사용
      setMessage(
        response.message || "비밀번호 재설정 링크가 이메일로 전송되었습니다."
      );
      setTimeout(() => navigate("/bgslogin"), 1000); // 5초 후 로그인 페이지로 이동
    } catch (err) {
      if (err.response?.status === 400) {
        setError("등록되지 않은 이메일입니다.");
      } else {
        setError(
          err.response?.data?.message ||
            "비밀번호 재설정 요청 실패. 다시 시도해주세요."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white px-10 py-24">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-5 left-3 text-black font-medium p-2 rounded hover:bg-gray-100 flex items-center space-x-2"
      >
        <ChevronLeftIcon className="w-6 h-6" />
      </button>

      {/* ✅ 제목 */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">비밀번호 재설정</h2>

      {/* ✅ 안내 문구 */}
      <p className="text-gray-500 text-sm mb-12 text-center">
        기존에 가입하신 이메일을 입력하시면, <br />
        임시 비밀번호를 메일로 발송해드립니다.
      </p>

      {/* ✅ 비밀번호 찾기 폼 */}
      <form className="space-y-6 w-full max-w-md" onSubmit={handleSubmit}>
        {/* 이메일 입력 */}
        <input
          type="email"
          placeholder="이메일을 입력하세요"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 border rounded-lg focus:ring focus:ring-blue-300 text-lg"
          required
        />
      </form>

      {/* ✅ 임시 비밀번호 발급 버튼 */}
      <div className="mt-12 w-full max-w-md">
        <button
          type="submit"
          onClick={handleSubmit}
          className={`w-full p-4 rounded-lg text-lg font-semibold transition ${
            email && !loading
              ? "bg-primary text-white hover:bg-primary-light"
              : "bg-white text-primary-light border border-primary-light cursor-not-allowed"
          }`}
          disabled={!email || loading}
        >
          {loading ? "처리 중..." : "비밀번호 재설정"}
        </button>
      </div>

      {/* ✅ 에러 메시지 또는 성공 메시지 */}
      <div className="mt-8 w-full max-w-md text-center">
        {error && <p className="text-red-500 text-lg">{error}</p>}
        {message && <p className="text-green-500 text-lg">{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
