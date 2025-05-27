// ProtectedLayout.jsx
import { Outlet } from "react-router-dom";
import useProfileGuard from "../../hooks/useProfileGuard";
import useUserStore from "../../stores/useUserStore";

const ProtectedLayout = () => {
  const accountType = useUserStore((state) => state.me.accountType);
  // accountType이 "KAKAO"일 때만 프로필 체크 실행
  useProfileGuard(accountType === "KAKAO");
  return <Outlet />;
};

export default ProtectedLayout;
