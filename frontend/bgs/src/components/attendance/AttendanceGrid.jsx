import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { getAttendanceByDate, checkAttendance } from "../../api/Attendance";

const AttendanceGrid = forwardRef((props, ref) => {
  const [attendanceMap, setAttendanceMap] = useState({});
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const formatDate = (date) => date.toISOString().slice(0, 10);

  // 1월 1일부터 12월 31일까지 한 주 단위로 계산
  const startOfYear = new Date(currentYear, 0, 1);
  const weeksInYear = Math.ceil(
    (new Date(currentYear, 11, 31) - startOfYear) / (7 * 24 * 60 * 60 * 1000)
  );

  const generateWeeks = () => {
    let weeks = [];
    let day = new Date(startOfYear);
    for (let week = 0; week < weeksInYear; week++) {
      let daysInWeek = [];
      for (let i = 0; i < 7; i++) {
        daysInWeek.push(new Date(day));
        day.setDate(day.getDate() + 1);
      }
      weeks.push(daysInWeek);
    }
    return weeks;
  };

  const weeks = generateWeeks();

  useEffect(() => {
    const fetchAttendanceData = async () => {
      const newMap = {};
      let d = new Date(currentYear, 0, 1);
      while (d <= currentDate) {
        const dateStr = formatDate(d);
        try {
          const data = await getAttendanceByDate(dateStr);
          newMap[dateStr] =
            data && data.length > 0 && data[0].attendanceId ? data[0] : null;
        } catch (err) {
          newMap[dateStr] = null;
        }
        d.setDate(d.getDate() + 1);
      }
      setAttendanceMap(newMap);
    };
    fetchAttendanceData();
  }, [currentYear, currentDate]);

  const handleCheckAttendance = () => {
    if (!navigator.geolocation) {
      alert("이 브라우저는 위치 정보를 지원하지 않습니다.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const todayStr = formatDate(new Date());
        const attendanceData = { latitude, longitude };
        try {
          await checkAttendance(attendanceData);
          setAttendanceMap((prev) => ({ ...prev, [todayStr]: attendanceData }));
        } catch (err) {
          console.error("출석 체크 실패:", err);
          alert("출석 체크에 실패했습니다.");
        }
      },
      (error) => {
        console.error("위치 정보를 가져오는데 실패했습니다.", error);
        alert("위치 정보를 가져오는데 실패했습니다.");
      }
    );
  };

  useImperativeHandle(ref, () => ({
    handleCheckAttendance,
  }));

  // 출석 데이터 색상 강도 설정
  const getColorIntensity = (date) => {
    const dateStr = formatDate(date);
    if (!attendanceMap[dateStr]) return "#ebedf0"; // 기본 회색
    return [
      "#ebedf0", // 없음
      "#c6e48b", // 1~2회
      "#7bc96f", // 3~4회
      "#239a3b", // 5~6회
      "#196127", // 7회 이상 (최대)
    ][Math.min(4, Math.floor(Math.random() * 5))]; // (예제용 랜덤, 실제 데이터 적용 가능)
  };

  return (
    <div className="overflow-x-auto w-full px-4" style={{ whiteSpace: "nowrap" }}>
      <div className="inline-block min-w-full">
        
        {/* 월(Month) 레이블 */}
        <div className="flex justify-between text-gray-500 text-xs px-2 mb-1">
          {weeks.map((week, weekIndex) => {
            const firstDay = week[0];
            return (
              firstDay.getDate() <= 7 && (
                <span key={weekIndex} className="w-[14px] text-center">
                  {firstDay.toLocaleString("en", { month: "short" })}
                </span>
              )
            );
          })}
        </div>

        <div className="flex">
          {/* 요일 레이블 */}
          <div className="flex flex-col justify-between text-gray-500 text-xs pr-2">
            {["Mon", "Wed", "Thu", "Fri"].map((day, index) => (
              <span key={index} style={{ height: "14px", lineHeight: "14px" }}>
                {day}
              </span>
            ))}
          </div>

          {/* 출석 데이터 렌더링 */}
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${weeks.length}, 14px)`, // 주 단위
              gridTemplateRows: "repeat(7, 14px)", // 요일 (일~토)
            }}
          >
            {weeks.flat().map((day, index) => (
              <div
                key={index}
                title={formatDate(day)}
                style={{
                  width: "14px",
                  height: "14px",
                  backgroundColor: getColorIntensity(day),
                  borderRadius: "2px",
                  cursor: "pointer",
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* 범례 */}
        <div className="flex items-center text-gray-500 text-xs mt-2">
          <span>Less</span>
          <div className="flex ml-2">
            {["#ebedf0", "#c6e48b", "#7bc96f", "#239a3b", "#196127"].map((color, index) => (
              <div key={index} style={{
                width: "14px",
                height: "14px",
                backgroundColor: color,
                marginLeft: "2px",
                borderRadius: "2px",
              }}></div>
            ))}
          </div>
          <span className="ml-2">More</span>
        </div>
      </div>
    </div>
  );
});

export default AttendanceGrid;
