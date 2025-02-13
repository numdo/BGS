import { useRef, useState, useEffect } from "react";
import BottomBar from "../../components/bar/BottomBar";
import TopBar from "../../components/bar/TopBar";
import { useNavigate } from "react-router-dom";
import { handleLogout } from "../../api/Auth";
import mascot from "../../assets/images/mascot.png";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import { Chart } from "primereact/chart";

export default function MainPage() {
  const navigate = useNavigate();

  const handleAttendanceCheck = async () => {
    try {
      setIsLoading(true);

      // 예: 아무 파라미터 없이 오늘 날짜를 서버에서 체크하는 경우
      // 혹은 { date: "YYYY-MM-DD" } 형태로 필요한 데이터 전달
      const result = await checkAttendance();

      // 체크 성공 시 처리 (ex. 결과 메시지, 팝업, 콘솔 출력 등)
      console.log("출석 체크 완료:", result);

      // 원하는 동작 (토스트메시지, 이동 등)
      alert("출석 체크가 완료되었습니다!");
      // navigate("/어딘가"); // 필요 시 페이지 이동
    } catch (error) {
      console.error("출석 체크 실패:", error);
      alert("출석 체크에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // (2) Radar 차트에 사용할 데이터
  const radarData = {
    labels: ["근력", "속도", "지구력", "유연성", "파워", "협응성"],
    datasets: [
      {
        label: "내 운동 지표",
        data: [65, 59, 90, 81, 56, 55],
        fill: true,
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgb(54, 162, 235)",
        pointBackgroundColor: "rgb(54, 162, 235)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(54, 162, 235)",
      },
    ],
  };

  // (3) 옵션 예시
  const radarOptions = {
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
  };

  return (
    <>
      <TopBar />
      <div className="m-4 mb-24">
        {/* 마스코트 이미지를 감싸는 컨테이너. relative로 설정 */}
        <div className="relative flex justify-center mt-12 mb-12">
          {/* 그라디언트 배경 (둥글고 흐릿한 그림자) */}
          <div
            className="absolute w-72 h-72 bg-gradient-to-r from-red-300 to-pink-300 rounded-full blur-3xl opacity-70 -z-10 
                          top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />

          {/* 실제 마스코트 이미지. Shadow 추가로 입체감 부여 가능 */}
          <img
            src={mascot}
            alt="마스코트 이미지"
            className="w-64 h-auto drop-shadow-2xl"
          />
        </div>

        {/* 상단 그리드: 2개의 버튼 */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={(e) => {
              e.currentTarget.blur(); // 클릭 후 포커스 제거
              handleAttendanceCheck(e);
            }}
            onMouseUp={(e) => e.currentTarget.blur()} // 마우스 업 시에도 포커스 제거
            className="flex flex-col items-start p-4 bg-white border rounded-lg transition-all duration-200 focus:outline-none"
          >
            {/* 제목과 아이콘을 한 행에 */}
            <div className="flex justify-between items-center w-full">
              <p className="text-xl font-semibold text-gray-800">출석 체크</p>
              <span className="text-2xl">📆</span>
            </div>
            <p className="text-base text-gray-600 mt-1 text-left break-keep">
              지금 헬스장이신데 출석은 하셨나요?
            </p>
          </button>

          <button
            onClick={() => navigate("/mygym")}
            className="flex flex-col items-start p-4 bg-white border rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <div className="flex justify-between items-center w-full">
              <p className="text-xl font-semibold text-gray-800">마이짐</p>
              <span className="text-2xl">💪</span>
            </div>
            <p className="text-base text-base text-gray-600 text-left mt-1 break-keep">
              나만의 마이짐을 꾸며보세요!
            </p>
          </button>
        </div>

        {/* 하단 그리드: 3개의 버튼 */}
        <div className="grid grid-cols-3 gap-4 mt-5">
          <button
            onClick={() => navigate("/workout")}
            className="flex flex-col items-start p-4 bg-white border rounded-lg hover:bg-gray-100 transition-all duration-200"
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
            className="flex flex-col items-start p-4 bg-white border rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <div className="flex justify-between items-center w-full">
              <p className="text-xl font-semibold text-gray-800">피드</p>
              <span className="text-2xl">👀</span>
            </div>
            <p className="text-sm text-gray-600 mt-1 text-left break-keep">
              불끈이들의 오운완을을 구경해보세요!
            </p>
          </button>

          <button
            onClick={() => navigate("/evaluationcreate")}
            className="flex flex-col items-start p-4 bg-white border rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <div className="flex justify-between items-center w-full">
              <p className="text-xl font-semibold text-gray-800">평가</p>
              <span className="text-2xl">⭐</span>
            </div>
            <p className="text-sm text-gray-600 mt-1 text-left break-keep">
              3대 운동을 자랑하고 평가해봐요!
            </p>
          </button>
        </div>
        <div className="mt-12 mb-12">
          <Chart type="radar" data={radarData} options={radarOptions} />
        </div>
      </div>

      <BottomBar />
    </>
  );
}
