import { useState } from "react";

// 달력에 체크 표시할 날짜(예: ["2025-02-07", "2025-02-10"])
// selectedDate: 현재 선택된 날짜
// onDateSelect: 날짜 클릭 시 상위로 전달
// diaryDates: "YYYY-MM-DD" 형식으로 일지 있는 날짜 배열
const WorkoutCalendar = ({ onDateSelect, selectedDate, diaryDates = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date()); // 현재 (년/월/일) 추적

  const handleDateClick = (day) => {
    if (day) {
      // day는 1~31
      const newDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      onDateSelect(newDate);
    }
  };

  const handleChangeMonth = (increment) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    onDateSelect(new Date());
  };

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  const firstDayWeekday = firstDayOfMonth.getDay(); // 0=일,1=월,...
  const daysInMonth = lastDayOfMonth.getDate(); // 이번 달 총 일수

  // 달력에서 특정 day를 "YYYY-MM-DD"로 포맷
  const formatDate = (year, month, day) => {
    // month는 0~11
    const y = year;
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const generateCalendar = () => {
    const days = [];
    // 첫 주에 비는 칸 추가
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(null);
    }
    // 이번 달 1일부터 daysInMonth까지 채우기
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const calendarDays = generateCalendar();

  return (
    <div className="mb-3 px-3 pt-1 pb-3 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-1">
        <button onClick={() => handleChangeMonth(-1)}>&lt;</button>
        <h2 className="text-lg font-bold text-gray-500">
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </h2>
        <button onClick={() => handleChangeMonth(1)}>&gt;</button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 text-center text-gray-500 font-semibold">
        {["일", "월", "화", "수", "목", "금", "토"].map((dayName) => (
          <div key={dayName}>{dayName}</div>
        ))}
      </div>

      {/* 날짜 영역 */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {calendarDays.map((day, index) => {
          // 날짜가 null인 칸(이전월 공백)은 클릭 안 되도록 처리
          if (!day) {
            return <div key={index} className="p-2 bg-gray-50 rounded-md" />;
          }

          // 현재 셀의 연/월/일
          const y = currentDate.getFullYear();
          const m = currentDate.getMonth();
          const formattedStr = formatDate(y, m, day);

          // 일지 존재 여부
          const hasDiary = diaryDates.includes(formattedStr);

          // 날짜 클릭 핸들러
          const onClick = () => handleDateClick(day);

          // selectedDate와 같은지 비교
          const isSelected =
            selectedDate &&
            selectedDate.getFullYear() === y &&
            selectedDate.getMonth() === m &&
            selectedDate.getDate() === day;

          return (
            <div
              key={index}
              className={`relative px-1 py-2 rounded-md border border-gray-200 cursor-pointer ${
                isSelected ? "bg-primary text-white" : "bg-white text-gray-500"
              }`}
              onClick={onClick}
            >
              {/* 날짜 숫자 */}
              <div className="z-10 ">{day}</div>

              {/* 체크 이모지 표시 (반투명) */}
              {hasDiary && (
                <span
                  className="absolute text-xl"
                  style={{
                    opacity: 0.5,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none", // 체크이모지 클릭 이벤트 무시
                  }}
                >
                  💪
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkoutCalendar;
