import { useNavigate, useLocation } from "react-router-dom";
import favicon from "../../assets/images/favicon.png";
import { ChevronLeftIcon } from "@heroicons/react/24/solid"; // npm install @heroicons/react

export default function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();

  // 뒤로가기 버튼을 숨길 경로 목록
  const hiddenPaths = ["/", "/mygym", "/myinfo", "/workout", "/feeds"];
  const shouldShowBackButton = !hiddenPaths.includes(location.pathname);

  return (
    <div className="w-full z-30 relative">
      {/* flex 컨테이너에서 로고는 가운데 정렬, 뒤로가기 버튼이 있을 때만 왼쪽 배치 */}
      <div className="flex items-center justify-center px-4 py-3 relative">
        {/* 뒤로가기 버튼 (숨길 경로가 아닐 때만 표시) */}
        {shouldShowBackButton && (
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 text-gray-600 hover:text-blue-500"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
        )}

        {/* 홈 버튼 (항상 가운데 정렬) */}
        <button
          onClick={() => navigate("/")}
          className="text-gray-600 hover:text-blue-500"
        >
          <img src={favicon} alt="Home" className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
