// src/components/workout/WorkoutCalendar.jsx
import { useState } from "react";

export default function WorkoutCalendar({
  onDateSelect,
  selectedDate,
  diaryDates = [],
  streakSegments = [],
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleDateClick = (day) => {
    if (!day) return;
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    onDateSelect && onDateSelect(newDate);
  };

  const handleChangeMonth = (increment) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  const formatDate = (year, month, day) => {
    const y = year;
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${y}-${m}-${d}`;
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
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const generateCalendar = () => {
    const days = [];
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };
  const calendarDays = generateCalendar();

  // 해당 날짜가 streakSegments 중 어느 구간에 속하는지 반환
  const getSegmentForDate = (dateStr) => {
    for (let seg of streakSegments) {
      if (dateStr >= seg.start && dateStr <= seg.end) {
        return seg;
      }
    }
    return null;
  };

  return (
    <div className="mb-3 px-3 pt-1 pb-3 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-1">
        <button onClick={() => handleChangeMonth(-1)}>&lt;</button>
        <h2 className="text-lg font-bold text-gray-500">
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </h2>
        <button onClick={() => handleChangeMonth(1)}>&gt;</button>
      </div>

      <div className="grid grid-cols-7 text-center text-gray-500 font-semibold">
        {["일", "월", "화", "수", "목", "금", "토"].map((dayName) => (
          <div key={dayName}>{dayName}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={index} className="p-2 bg-gray-50 rounded-md" />;
          }
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();
          const formattedStr = formatDate(year, month, day);
          const hasDiary = diaryDates.includes(formattedStr);
          const segment = getSegmentForDate(formattedStr);

          // 기본 스타일
          let cellStyle = {
            backgroundColor: "#ffffff",
            color: "#4B5563", // text-gray-600
            border: "1px solid #E5E7EB", // border-gray-200
          };

          if (segment) {
            if (segment.attended.has(formattedStr)) {
              // 실제 출석: 진한 테두리, 3px 두께
              cellStyle = {
                backgroundColor: "#ffffff",
                color: "#4B5563",
                border: "2px solid #5968eb",
              };
            } else {
              // 구간 내에 있지만 출석하지 않음: 얇은 테두리
              cellStyle = {
                backgroundColor: "#ffffff",
                color: "#4B5563",
                border: "1px solid #a3bffa", // 연한 파랑 (blue-300 느낌)
              };
            }
          }

          // 선택된 날짜 스타일: 배경 및 테두리 모두 메인 색상 적용
          const isSelected =
            selectedDate &&
            selectedDate.getFullYear() === year &&
            selectedDate.getMonth() === month &&
            selectedDate.getDate() === day;
          if (isSelected) {
            cellStyle = {
              backgroundColor: "#5968eb",
              color: "#000000",
              border: "2px solid #5968eb",
            };
          }

          return (
            <div
              key={index}
              onClick={() => handleDateClick(day)}
              className="relative px-1 py-2 rounded-md cursor-pointer transition-colors"
              style={cellStyle}
            >
              <div className="z-10">{day}</div>
              {hasDiary && (
                <span
                  className="absolute text-xl"
                  style={{
                    opacity: 0.5,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none",
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
}
