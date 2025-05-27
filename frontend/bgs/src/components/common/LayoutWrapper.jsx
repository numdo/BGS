import { useLocation } from "react-router-dom";

function LayoutWrapper({ children }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className={isAdminRoute ? "" : "min-w-[320px] max-w-[600px] mx-auto"}>
      {children}
    </div>
  );
}

export default LayoutWrapper;
