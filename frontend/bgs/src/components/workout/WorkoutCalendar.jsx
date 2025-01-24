import { useState } from 'react';

const WorkoutCalendar = ({ onDateSelect, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 0, 1)); // 2025년 1월

  const handleDateClick = (day) => {
    if (day) {
      const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      onDateSelect(newDate); // 날짜를 선택할 때 상위 컴포넌트로 전달
    }
  };

  // 오늘로 이동하는 함수
  const goToToday = () => {
    setCurrentMonth(new Date());
    onDateSelect(new Date()); // 오늘로 이동 시 선택 초기화
  };

  // 현재 월의 첫 날과 마지막 날 계산
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  // 첫 날의 요일 (0: 일요일, 1: 월요일 ...)
  const firstDayWeekday = firstDayOfMonth.getDay();

  // 월의 전체 날짜 수
  const daysInMonth = lastDayOfMonth.getDate();

  // 달력의 날짜 배열 생성
  const generateCalendar = () => {
    const days = [];
    // 이전 월의 공백 (빈 칸)
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(null);
    }
    // 현재 월의 날짜
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const calendarDays = generateCalendar();

  return (
    <div className="p-4 bg-gray-50">
      {/* 상단 바 */}
      <div className="flex justify-between items-center mb-4">
        {/* 좌측: 현재 년월 */}
        <h2 className="text-lg font-bold">
          {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
        </h2>
        {/* 우측: 오늘로 이동 */}
        <button onClick={goToToday} className="text-blue-500 hover:underline">
          오늘
        </button>
      </div>

      {/* 달력 */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {/* 요일 헤더 */}
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div key={index} className="font-semibold">
            {day}
          </div>
        ))}
        {/* 날짜들 */}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`p-2 ${
              day
                ? 'bg-white-200 text-gray-800 cursor-pointer'
                : 'bg-white-200'
            }`}
            onClick={() => handleDateClick(day)}
          >
            {day && (
              <div
                className={`relative inline-block ${
                  selectedDate &&
                  selectedDate.getDate() === day &&
                  selectedDate.getFullYear() === currentMonth.getFullYear() &&
                  selectedDate.getMonth() === currentMonth.getMonth()
                    ? 'w-6 h-6 bg-blue-500 rounded-full text-white flex items-center justify-center'
                    : ''
                }`}
              >
                {day}
                {selectedDate &&
                  selectedDate.getDate() === day &&
                  selectedDate.getFullYear() === currentMonth.getFullYear() &&
                  selectedDate.getMonth() === currentMonth.getMonth() && (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-500 rounded-full">
                      <span className="text-white">{day}</span>
                    </div>
                  )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutCalendar;
