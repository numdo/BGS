// src/components/auth/ProfileCompletionGuard.jsx
import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { getUser } from "../../api/User"; // 현재 사용자 정보를 가져오는 API 함수

const ProfileCompletionGuard = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const user = await getUser();
        // 필수 정보(닉네임, 이름, 생년월일, 성별, 몸무게)가 채워져 있지 않으면 소셜 회원가입 페이지로 리다이렉트
        if (
          user.nickname === null ||
          user.name === null ||
          user.birthDate === null ||
          user.sex === null ||
          user.weight === null
        ) {
          navigate("/social-signup");
        }
      } catch (err) {
        console.error("프로필 확인 중 오류 발생", err);
        // 오류 발생 시 로그인 페이지로 이동하는 등의 처리가 필요할 수 있음
      } finally {
        setLoading(false);
      }
    };
    checkProfile();
  }, [navigate]);

  if (loading) {
    return <div>프로필 정보를 확인 중입니다...</div>;
  }

  return <Outlet />;
};

export default ProfileCompletionGuard;
