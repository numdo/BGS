// src/pages/auth/SocialSignupPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../api/User";
import SocialSignupForm from "../../components/auth/SocialSignupForm";

const SocialSignupPage = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUser();
        setUserProfile(data);
        // 이미 프로필이 완성되어 있으면 메인 페이지로 이동
        if (
          data.nickname &&
          data.name &&
          data.birthDate &&
          data.sex &&
          data.weight
        ) {
          navigate("/");
        }
      } catch (err) {
        console.error("사용자 정보 조회 실패", err);
        // 혹시 getUser()가 401(만료) 등이면, 로그인 페이지로 이동할 수도 있음
        // navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {/* userProfile을 props로 넘기면, SocialSignupForm 내부에서 초기 값 설정 */}
      <SocialSignupForm userProfile={userProfile} />
    </div>
  );
};

export default SocialSignupPage;
