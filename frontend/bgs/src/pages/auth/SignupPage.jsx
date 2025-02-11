import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmailVerification from "../../components/auth/EmailVerification";
import SignupForm from "../../components/auth/SignupForm";
import { sendEmailVerify, receiveEmailVerify, signup } from "../../api/Auth";
import { ArrowLeft } from "lucide-react";
import logo_image from "../../assets/images/logo_image.png";
import name_image from "../../assets/images/name.png";

const SignupPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 이메일 입력 변경 시 인증 상태 리셋
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    // 이메일이 변경되면 기존 인증 상태를 초기화
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
    <div className="flex flex-col items-center justify-center h-screen bg-white px-10 py-16">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-5 left-5 text-black font-medium p-2 rounded hover:bg-gray-100 flex items-center space-x-2"
      >
        <ArrowLeft size={20} />
      </button>

      {/* 로고 영역 */}
      <div className="flex flex-col items-center space-x-4 mb-10">
        <img src={logo_image} alt="Logo" className="h-32" />
        <img src={name_image} alt="Name" className="h-15" />
      </div>

      {/* 인증 단계와 회원가입 폼을 조건부 렌더링 */}
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
