import React from "react";

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
  return (
    <div className="space-y-4 w-full max-w-md">
      {/* 이메일 입력란 */}
      <input
        name="email"
        type="email"
        placeholder="이메일"
        value={email}
        onChange={onEmailChange}
        className="w-full p-3 border rounded-lg border-black drop-shadow-lg focus:ring focus:ring-blue-300 text-base"
        required
      />
      {/* 인증 코드 보내기 버튼: isEmailSent가 true이면 버튼은 비활성화되고 텍스트가 변경됨 */}
      <button
        type="button"
        onClick={sendCode}
        disabled={loading || !email || isEmailSent}
        className={`w-full p-3 rounded-lg text-base font-semibold transition ${
          isEmailSent
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
      {/* isEmailSent가 true일 때만 인증번호 입력란과 확인 버튼 표시 */}
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
