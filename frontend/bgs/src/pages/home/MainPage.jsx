import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomBar from "../../components/bar/BottomBar";
import TopBar from "../../components/bar/TopBar";
import cutemascot from "../../assets/images/cutemascot.png";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import WeightRecordCard from "../../components/stat/WeightRecordCard";
import WeightHistoryChart from "../../components/stat/WeightHistoryChart";
import WorkoutBalanceRadarChart from "../../components/stat/WorkoutBalanceRadarChart";
import PartVolumeBarChart from "../../components/stat/PartVolumeBarChart";
import WorkoutRecordChart from "../../components/stat/WorkoutRecordChart";
import PredictedOneRMCard from "../../components/stat/PredictedOneRMCard";
import AttendanceCheck from "../../components/attendance/AttendanceCheck";
import ComprehensiveAdviceCard from "../../components/stat/ComprehensiveAdviceCard";
// 출석 API import
// LoadingSpinner (예: 로딩 표시)
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function MainPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

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
          <AttendanceCheck />

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
              3대 운동을 자랑하고 평가해보세요!
            </p>
          </button>
        </div>
        <div className="mt-4 mb-4">
          <WeightRecordCard />
        </div>
        <PredictedOneRMCard />
        <div className="mt-4 mb-4">
          <ComprehensiveAdviceCard />
        </div>
        {/* 레이더 차트 */}
        <div className="mt-4 mb-4">
          <WeightHistoryChart />
        </div>
        <div className="mt-4 mb-4">
          <WorkoutBalanceRadarChart />
        </div>
        <div className="mt-4 mb-4">
          <PartVolumeBarChart />
        </div>
        <div className="mt-4 mb-4">
          <WorkoutRecordChart />
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
