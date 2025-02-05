import { useState } from 'react';

const WorkoutCalendar = ({ onDateSelect, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date()); // 현재 년월일
  const handleDateClick = (day) => {
    if (day) {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      onDateSelect(newDate); // 날짜를 선택할 때 상위 컴포넌트로 전달
    }
  }
  const handleChangeMonth = (increment) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + increment)
    setCurrentDate(newDate)
  }
  const goToToday = () => {
    setCurrentDate(new Date())
    onDateSelect(new Date())
  }

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)   // 현재 월의 첫 날과 마지막 날 계산
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay()   // 첫 날의 요일 (0: 일요일, 1: 월요일 ...)
  const daysInMonth = lastDayOfMonth.getDate()   // 월의 전체 날짜 수
  const generateCalendar = () => {
    const days = []
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(null)     // 이전 월의 공백 (빈 칸)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)     // 현재 월의 날짜
    }
    return days;
  };
  const calendarDays = generateCalendar();

  return (
    <div className="mb-3 p-4 bg-gray-50 rounded-md">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => handleChangeMonth(-1)}>&lt;</button>
        <h2 className="text-lg font-bold">
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </h2>
        <button onClick={() => handleChangeMonth(1)}>&gt;</button>
        <button onClick={goToToday} className="text-blue-500 hover:underline">
          오늘
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div key={index} className="font-semibold">
            {day}
          </div>
        ))}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`p-2 ${day
              ? 'bg-white-200 text-gray-800 cursor-pointer'
              : 'bg-white-200'
              }`}
            onClick={() => handleDateClick(day)}
          >
            {day && (
              <div
                className={`relative inline-block ${selectedDate &&
                  selectedDate.getDate() === day &&
                  selectedDate.getFullYear() === currentDate.getFullYear() &&
                  selectedDate.getMonth() === currentDate.getMonth()
                  ? 'w-6 h-6 bg-gray-500 rounded-full text-white'
                  : ''
                  }`}
              >
                {day}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutCalendar;
