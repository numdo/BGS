import React, { useState } from "react";
import { checkEmail } from "../../api/Auth"; // 이메일 중복 체크 API 임포트

const EmailVerification = ({
  email,
  onEmailChange,
  code,
  setCode,
  sendCode,
  verifyCode,
  loading,
  error,
  isEmailSent,
}) => {
  // 이메일 상태: "available" (사용 가능), "unavailable" (이미 가입됨) 또는 null (아직 체크 안됨)
  const [emailStatus, setEmailStatus] = useState(null);
  // 이메일 형식 유효성 상태
  const [isEmailValid, setIsEmailValid] = useState(false);

  // 이메일 형식 검사용 정규표현식
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // 이메일 중복 체크 함수
  const handleEmailCheck = async () => {
    if (!email.trim()) {
      alert("이메일을 입력해 주세요.");
      return;
    }
    // 이메일 형식이 올바른지 재확인
    if (!isEmailValid) {
      alert("올바른 이메일 형식을 입력해 주세요.");
      return;
    }
    try {
      const result = await checkEmail(email);
      // API 응답 형식이 { available: true/false }라고 가정합니다.
      if (result.available) {
        setEmailStatus("available");
        alert("사용 가능한 이메일입니다.");
      } else {
        setEmailStatus("unavailable");
        alert("이미 가입된 이메일입니다.");
      }
    } catch (error) {
      console.error("이메일 중복 체크 오류", error);
      alert("이메일 중복 체크 중 오류 발생.");
    }
  };

  // 이메일 입력 변경 시 호출되는 함수
  const handleEmailChange = (e) => {
    onEmailChange(e);
    // 이메일이 변경되면 중복 체크 결과 초기화
    setEmailStatus(null);
    const value = e.target.value;
    // 이메일 형식 유효성 체크
    setIsEmailValid(emailRegex.test(value));
  };

  return (
    <div className="space-y-4 w-full max-w-md">
      {/* 이메일 입력 및 중복 체크 버튼 */}
      <div className="flex space-x-2">
        <input
          name="email"
          type="email"
          placeholder="이메일"
          value={email}
          onChange={handleEmailChange}
          className="flex-grow p-3 border rounded-lg border-black drop-shadow-lg focus:ring focus:ring-blue-300 text-base"
          required
        />
        <button
          type="button"
          onClick={handleEmailCheck}
          disabled={loading || !email || !isEmailValid}
          className={`p-3 rounded-lg text-base font-semibold transition ${
            loading || !email || !isEmailValid
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          중복 체크
        </button>
      </div>
      {/* 이메일 형식 유효성 안내 메시지 */}
      {!isEmailValid && email && (
        <p className="text-red-500 text-sm text-center">
          올바른 이메일 형식을 입력해 주세요.
        </p>
      )}
      {/* 이메일 중복 체크 결과 메시지 */}
      {emailStatus === "available" && (
        <p className="text-green-500 text-sm text-center">
          사용 가능한 이메일입니다.
        </p>
      )}
      {emailStatus === "unavailable" && (
        <p className="text-red-500 text-sm text-center">
          이미 가입된 이메일입니다.
        </p>
      )}
      {/* 인증 코드 보내기 버튼 */}
      <button
        type="button"
        onClick={sendCode}
        disabled={
          loading ||
          !email ||
          !isEmailValid ||
          isEmailSent ||
          emailStatus !== "available"
        }
        className={`w-full p-3 rounded-lg text-base font-semibold transition ${
          isEmailSent || emailStatus !== "available"
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-green-500 text-white hover:bg-green-600"
        }`}
      >
        {isEmailSent
          ? "인증 코드가 전송되었습니다"
          : loading
          ? "전송 중..."
          : "인증 코드 보내기"}
      </button>
      {/* 인증 코드 입력 및 확인 버튼 (인증 코드 전송 후 표시) */}
      {isEmailSent && (
        <div className="flex space-x-2">
          <input
            name="verificationCode"
            placeholder="인증번호"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 p-3 border rounded-lg border-black drop-shadow-lg focus:ring focus:ring-blue-300 text-base"
            required
          />
          <button
            type="button"
            onClick={() => verifyCode(code)}
            disabled={loading || !code}
            className="p-3 rounded-lg text-base font-semibold transition bg-blue-500 text-white hover:bg-blue-600"
          >
            확인
          </button>
        </div>
      )}
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
    </div>
  );
};

export default EmailVerification;
