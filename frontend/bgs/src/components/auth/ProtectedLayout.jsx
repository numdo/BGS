// ProtectedLayout.jsx
import { Outlet } from "react-router-dom";
import useProfileGuard from "../../hooks/useProfileGuard";

const ProtectedLayout = () => {
  // 여기서 한 번만 프로필 체크
  useProfileGuard();
  return <Outlet />;
};

export default ProtectedLayout;
