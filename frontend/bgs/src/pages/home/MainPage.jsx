import { useEffect, useState } from "react";
import BottomBar from "../../components/bar/BottomBar";
import TopBar from "../../components/bar/TopBar";
import { useNavigate } from "react-router-dom";
import mascot from "../../assets/images/mascot.png";
import cutemascot from "../../assets/images/cutemascot.png";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import WeightRecordCard from "../../components/stat/WeightRecordCard";
import WeightHistoryChart from "../../components/stat/WeightHistoryChart";
import WorkoutBalanceRadarChart from "../../components/stat/WorkoutBalanceRadarChart";
import PartVolumeBarChart from "../../components/stat/PartVolumeBarChart";
import useUserStore from "../../stores/useUserStore";

// toastrAlert 함수들 import
import {
  showConfirmAlert,
  showErrorAlert,
  showSuccessAlert,
} from "../../utils/toastrAlert";
// 출석 API import (BASE_URL이 "/api/attendance"로 되어 있어야 합니다)
import { checkAttendance } from "../../api/Attendance";
// LoadingSpinner (예: 로딩 표시)
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function MainPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { fetchMe } = useUserStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const handleAttendanceCheck = async () => {
    // 사용자의 위치 정보를 가져오기 위해 Geolocation API 사용
    if (!navigator.geolocation) {
      await showErrorAlert("현재 위치를 가져올 수 없습니다.");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // 출석 체크 API 호출 시 현재 위치 정보를 보내줍니다.
          const result = await checkAttendance({ latitude, longitude });
          setIsLoading(false); // 결과를 받은 후 로딩 해제

          // 백엔드에서 반환한 결과에 streak(연속 출석 일수)가 있다면 메세지에 추가
          let successMessage = result.message || "출석 체크가 완료되었습니다!";
          if (result.streak !== undefined && result.streak !== null) {
            successMessage += ` (연속 출석 일수: ${result.streak}일)`;
          }
          await showSuccessAlert(successMessage);
        } catch (error) {
          setIsLoading(false); // 에러 발생 시 로딩 해제

          // error.response.data가 문자열이면 그대로 사용하고, 아니면 message 필드를 확인합니다.
          const errorMsg =
            typeof error.response?.data === "string"
              ? error.response.data
              : error.response?.data?.message ||
                "출석 체크에 실패했습니다. 다시 시도해주세요.";
          await showErrorAlert(errorMsg);
        }
      },
      async (error) => {
        setIsLoading(false); // 위치 정보를 가져오지 못했을 경우에도 로딩 해제
        await showErrorAlert("현재 위치를 가져올 수 없습니다.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <>
      <TopBar />
      <div className="m-4 mb-24 relative">
        {/* 마스코트 이미지 영역 */}
        <div className="relative flex justify-center mt-12 mb-12">
          <div
            className="absolute w-72 h-72 bg-gradient-to-r from-red-300 to-pink-300
                       rounded-full blur-3xl opacity-70 -z-10 
                       top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />
          <img
            src={cutemascot}
            alt="마스코트 이미지"
            className="w-64 h-auto drop-shadow-2xl"
          />
        </div>

        {/* 상단 그리드: 2개의 버튼 */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={async () => {
              await handleAttendanceCheck();
            }}
            className="flex flex-col items-start p-4 bg-white border rounded-lg transition-all duration-200 focus:outline-none shadow-md hover:bg-gray-100"
          >
            <div className="flex justify-between items-center w-full">
              <p className="text-xl font-semibold text-gray-800">출석 체크</p>
              <span className="text-2xl">📆</span>
            </div>
            <p className="text-base text-gray-600 mt-1 text-left break-keep">
              500m 근처에 헬스장이 있을 경우, 출석체크가 완료됩니다.
            </p>
          </button>

          <button
            onClick={() => navigate("/mygym")}
            className="flex flex-col items-start p-4 bg-white border rounded-lg transition-all duration-200 focus:outline-none shadow-md hover:bg-gray-100"
          >
            <div className="flex justify-between items-center w-full">
              <p className="text-xl font-semibold text-gray-800">마이짐</p>
              <span className="text-2xl">💪</span>
            </div>
            <p className="text-base text-gray-600 mt-1 text-left break-keep">
              나만의 마이짐을 꾸며보세요!
            </p>
          </button>
        </div>

        {/* 하단 그리드: 3개의 버튼 */}
        <div className="grid grid-cols-3 gap-4 mt-5">
          <button
            onClick={() => navigate("/workout")}
            className="flex flex-col items-start p-3 bg-white border rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-md"
          >
            <div className="flex justify-between items-center w-full">
              <p className="text-xl font-semibold text-gray-800">일지</p>
              <span className="text-2xl">📓</span>
            </div>
            <p className="text-sm text-gray-600 mt-1 text-left break-keep">
              오늘의 운동을 기록하고 성장해보세요!
            </p>
          </button>

          <button
            onClick={() => navigate("/feeds")}
            className="flex flex-col items-start p-3 bg-white border rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-md"
          >
            <div className="flex justify-between items-center w-full">
              <p className="text-xl font-semibold text-gray-800">피드</p>
              <span className="text-2xl">👀</span>
            </div>
            <p className="text-sm text-gray-600 mt-1 text-left break-keep">
              불끈이들의 오운완을 구경해보세요!
            </p>
          </button>

          <button
            onClick={() => navigate("/evaluationcreate")}
            className="flex flex-col items-start p-3 bg-white border rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-md"
          >
            <div className="flex justify-between items-center w-full">
              <p className="text-xl font-semibold text-gray-800">평가</p>
              <span className="text-2xl">⭐</span>
            </div>
            <p className="text-sm text-gray-600 mt-1 text-left break-keep">
              3대 운동을 자랑하고 평가해보세요요!
            </p>
          </button>
        </div>
        <div className="mt-8">
          <WeightRecordCard />
        </div>
        {/* 레이더 차트 */}
        <div className="mt-12 mb-12">
          <WeightHistoryChart />
        </div>
        <div className="mt-12 mb-12">
          <WorkoutBalanceRadarChart />
        </div>
        <div className="mt-12 mb-12">
          <PartVolumeBarChart />
        </div>
      </div>

      <BottomBar />

      {/* 로딩 스피너 오버레이 */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <LoadingSpinner />
        </div>
      )}
    </>
  );
}
