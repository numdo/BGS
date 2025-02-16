import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmailVerification from "../../components/auth/EmailVerification";
import SignupForm from "../../components/auth/SignupForm";
import { sendEmailVerify, receiveEmailVerify, signup } from "../../api/Auth";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import logo_image from "../../assets/images/logo_image.png";
import name_image from "../../assets/images/name.png";
import LogoSection from "../../components/common/LogoSection";

const SignupPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setIsEmailSent(false);
    setIsVerified(false);
    setVerificationCode("");
    setError("");
  };

  const sendCode = async () => {
    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }
    try {
      setLoading(true);
      await sendEmailVerify(email);
      setIsEmailSent(true);
      alert("인증 코드가 전송되었습니다. 이메일을 확인하세요.");
      setError("");
    } catch (err) {
      console.error(err);
      setError("인증 코드 전송에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const verify = async (code) => {
    if (!email || !code) {
      setError("이메일과 인증번호를 모두 입력해주세요.");
      return;
    }
    try {
      setLoading(true);
      const result = await receiveEmailVerify(email, code);
      if (typeof result === "string" && result.includes("성공")) {
        setIsVerified(true);
        alert("이메일 인증에 성공했습니다.");
        setError("");
      } else {
        setError("인증 번호가 일치하지 않습니다.");
      }
    } catch (err) {
      console.error(err);
      setError("인증 번호 검증 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (signupData) => {
    try {
      setLoading(true);
      await signup(signupData);
      alert("회원가입이 완료되었습니다.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.response?.data || "회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-white px-10 py-16 relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-5 left-3 text-black font-medium p-2 rounded hover:bg-gray-100 flex items-center space-x-2"
      >
        <ChevronLeftIcon className="w-6 h-6" />
      </button>
      <div className="flex flex-col items-center space-x-4 mt-10">
        <LogoSection />
      </div>
      {!isVerified ? (
        <EmailVerification
          email={email}
          onEmailChange={handleEmailChange}
          code={verificationCode}
          setCode={setVerificationCode}
          sendCode={sendCode}
          verifyCode={verify}
          loading={loading}
          error={error}
          isEmailSent={isEmailSent}
        />
      ) : (
        <SignupForm
          email={email}
          onSubmit={handleSignupSubmit}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
};

export default SignupPage;
