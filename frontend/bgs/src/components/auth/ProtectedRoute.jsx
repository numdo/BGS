// src/components/auth/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("accessToken");
  // 토큰이 없으면 /login으로 이동
  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
