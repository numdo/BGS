// src/hooks/useProfileGuard.js
import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import {
  profileState,
  profileLoadingState,
  profileIncompleteState,
} from "../recoil/profileState";
import { getUser } from "../api/User";

const useProfileGuard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useRecoilState(profileState);
  const [loading, setLoading] = useRecoilState(profileLoadingState);
  const [profileIncomplete, setProfileIncomplete] =
    useRecoilState(profileIncompleteState);

  useEffect(() => {
    const checkProfile = async () => {
      console.log("[useProfileGuard] checkProfile 호출");
      setLoading(true);
      try {
        const user = await getUser();
        console.log("[useProfileGuard] 백엔드에서 받은 user:", user);

        setProfile(user);
        // 필수 정보가 모두 있으면 profileIncomplete = false, 그렇지 않으면 true
        if (
          !user.nickname?.trim() ||
          !user.name?.trim() ||
          !user.birthDate?.trim() ||
          !user.sex?.trim() ||
          !user.weight
        ) {
          console.log("[useProfileGuard] 필수 정보가 없어 프로필 미완성 상태");
          setProfileIncomplete(true);
        } else {
          console.log("[useProfileGuard] 필수 정보가 모두 존재해 프로필 완성 상태");
          setProfileIncomplete(false);
        }
      } catch (err) {
        console.error("[useProfileGuard] 프로필 확인 중 오류 발생:", err);
        // 401 등 토큰 만료 시 /login 이동
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    checkProfile();
  }, [navigate, setProfile, setProfileIncomplete, setLoading]);

  // 로딩 완료 후, 프로필이 미완성이라면 /social-signup으로 보냄
  useEffect(() => {
    if (!loading) {
      console.log(
        "[useProfileGuard] 로딩 완료. profileIncomplete:",
        profileIncomplete
      );
      if (profileIncomplete) {
        console.log("[useProfileGuard] /social-signup으로 이동");
        navigate("/social-signup");
      }
    }
  }, [loading, profileIncomplete, navigate]);

  return { loading, profileIncomplete, profile };
};

export default useProfileGuard;
