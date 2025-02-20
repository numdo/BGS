import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import favicon from "../../assets/images/favicon.png";
import { ChevronLeftIcon } from "@heroicons/react/24/solid"; // npm install @heroicons/react
import { getUser } from "../../api/User"; // getUser 함수 임포트 위치 확인

import useCoinStore from "../../stores/useCoinStore";

export default function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();

  // 뒤로가기 버튼을 숨길 경로 목록
  const hiddenPaths = ["/", "/mygym", "/myinfo", "/workout", "/feeds"];
  const shouldShowBackButton = !hiddenPaths.includes(location.pathname);

  const { coinCount, setCoinCount } = useCoinStore();

  // 컴포넌트 마운트 시 내 정보(코인)를 가져오기
  useEffect(() => {
    const fetchUserCoin = async () => {
      try {
        // userId가 0이면 /users/me로 조회하도록 되어 있음
        const userData = await getUser(0);
        // 만약 userData.coin(또는 userData.coinCount) 형태라면 상황에 맞게 수정
        setCoinCount(userData.coin);
      } catch (error) {
        console.error("Failed to get user info:", error);
      }
    };

    fetchUserCoin();
  }, []);
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

        {/* 코인 표시 (우측 상단) */}
        <div className="absolute right-4 text-gray-600 flex items-center">
          <span className="text-xl">🪙</span>
          {/* 코인 개수 */}
          <span className="ml-1 text-base font-semibold">{coinCount}</span>
        </div>
      </div>
    </div>
  );
}
