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

const useProfileGuard = (enabled = true) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useRecoilState(profileState);
  const [loading, setLoading] = useRecoilState(profileLoadingState);
  const [profileIncomplete, setProfileIncomplete] = useRecoilState(profileIncompleteState);

  useEffect(() => {
    if (!enabled) return; // 프로필 체크가 비활성화된 경우 실행하지 않음.
    const checkProfile = async () => {
      setLoading(true);
      try {
        const user = await getUser();
        setProfile(user);
        // 필수 정보가 모두 있으면 profileIncomplete = false, 그렇지 않으면 true
        if (
          !user.nickname?.trim() ||
          !user.name?.trim() ||
          !user.birthDate?.trim() ||
          !user.sex?.trim() ||
          !user.weight
        ) {
          setProfileIncomplete(true);
        } else {
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
  }, [enabled, navigate, setProfile, setProfileIncomplete, setLoading]);

  useEffect(() => {
    if (!enabled) return; // 프로필 체크가 비활성화된 경우 실행하지 않음.
    if (!loading) {
      if (profileIncomplete) {
        navigate("/social-signup");
      }
    }
  }, [enabled, loading, profileIncomplete, navigate]);

  return { loading, profileIncomplete, profile };
};

export default useProfileGuard;
