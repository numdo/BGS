// src/components/attendance/AttendanceCheck.jsx
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { checkAttendance, getAttendanceByDate } from "../../api/Attendance";
import {
  showErrorAlert,
  showSuccessAlert,
  showInformAlert,
} from "../../utils/toastrAlert";

export default function AttendanceCheck() {
  const [isAttended, setIsAttended] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 페이지 마운트 시 오늘 출석 여부를 확인 (백엔드가 List<AttendanceCheckResponseDto> 반환)
  useEffect(() => {
    const checkTodayAttendance = async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      try {
        const result = await getAttendanceByDate(today);
        // 백엔드에서 오늘 출석 기록이 하나라도 있다면 출석한 것으로 간주합니다.
        if (result && Array.isArray(result) && result.length > 0) {
          setIsAttended(true);
        } else {
          setIsAttended(false);
        }
      } catch (error) {
        console.error("오늘 출석 여부 확인 오류:", error);
      }
    };

    checkTodayAttendance();
  }, []);

  const handleAttendance = async () => {
    // 이미 출석한 경우
    if (isAttended) {
      await showInformAlert("오늘 출석을 완료 하였습니다.");
      return;
    }

    // 위치 정보 제공 여부 확인
    if (!navigator.geolocation) {
      await showErrorAlert("현재 위치를 가져올 수 없습니다.");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const result = await checkAttendance({ latitude, longitude });
          setIsAttended(true);
          setIsLoading(false);
          let successMessage = result.message || "출석 체크가 완료되었습니다!";
          if (result.streak !== undefined && result.streak !== null) {
            successMessage += ` (연속 출석 일수: ${result.streak}일)`;
          }
          await showSuccessAlert(successMessage);
        } catch (error) {
          setIsLoading(false);
          const errorMsg =
            typeof error.response?.data === "string"
              ? error.response.data
              : error.response?.data?.message ||
                "출석 체크에 실패했습니다. 다시 시도해주세요.";
          await showErrorAlert(errorMsg);
        }
      },
      async (error) => {
        setIsLoading(false);
        await showErrorAlert("현재 위치를 가져올 수 없습니다.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <button
      onClick={handleAttendance}
      className={`flex flex-col items-start p-4 bg-white border rounded-lg transition-all duration-200 focus:outline-none shadow-md ${
        isAttended ? "bg-gray-300" : "hover:bg-gray-100"
      }`}
      disabled={isLoading}
    >
      <div className="flex justify-between items-center w-full">
        <p className="text-xl font-semibold text-gray-800">
          {isAttended ? "출석 완료" : "출석 체크"}
        </p>
        <span className="text-2xl">{isAttended ? "🎯" : "📆"}</span>
      </div>
      <p className="text-base text-gray-600 mt-1 text-left break-keep">
        헬스장 500m 근처에서 버튼을 눌러 출석하세요!
      </p>
    </button>
  );
}
