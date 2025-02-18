import React, { useState, useCallback, useEffect } from "react";
import Calendar from "react-calendar";
import styled from "styled-components";
import moment from "moment";
import "react-calendar/dist/Calendar.css";

// Styled Components (원본 디자인 그대로)
const StyledCalendarWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  position: relative;

  .react-calendar {
    width: 100%;
    border: none;
    border-radius: 0.5rem;
    box-shadow: 4px 2px 10px rgba(0, 0, 0, 0.13);
    padding: 3% 5%;
    background-color: white;
  }

  .react-calendar__month-view abbr {
    color: ${(props) => props.theme.gray_1 || "#555"};
  }

  .react-calendar__navigation {
    justify-content: center;
  }

  .react-calendar__navigation button {
    font-weight: 800;
    font-size: 1rem;
  }

  .react-calendar__navigation button:focus,
  .react-calendar__navigation button:disabled {
    background-color: white;
    color: ${(props) => props.theme.darkBlack || "#000"};
  }

  .react-calendar__navigation__label {
    flex-grow: 0 !important;
  }

  .react-calendar__month-view__weekdays abbr {
    text-decoration: none;
    font-weight: 800;
  }

  .react-calendar__month-view__weekdays__weekday--weekend abbr[title="일요일"] {
    color: ${(props) => props.theme.red_1 || "red"};
  }

  .react-calendar__tile {
    padding: 5px 0px 18px;
    position: relative;
    background: none !important;
    color: ${(props) => props.theme.gray_1 || "#555"};
    display: flex;
    align-items: center;
    justify-content: center;

    abbr {
      position: relative;
      z-index: 2;
    }
  }

  .react-calendar__tile--now {
    background: none !important;
    abbr {
      color: ${(props) => props.theme.primary_2 || "#00acc1"};
    }
  }

  .react-calendar__tile--active,
  .react-calendar__tile--active:enabled:hover,
  .react-calendar__tile--active:enabled:focus,
  .react-calendar__tile--hasActive,
  .react-calendar__tile--hasActive:enabled:hover,
  .react-calendar__tile--hasActive:enabled:focus {
    background: none !important;
    color: inherit;
  }

  .react-calendar__tile:enabled:hover {
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 80px;
      background-color: #7985ef;
      border-radius: 0.3rem;
      z-index: 1;
    }
    
    abbr {
      color: white;
    }
  }

  .custom-selected-date {
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 80px;
      background-color: #7985ef;
      border-radius: 0.3rem;
      z-index: 1;
    }
    
    abbr {
      color: white !important;
    }
  }
`;

const MarkerContainer = styled.div`
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  pointer-events: none;
  z-index: 2;
`;

const LegendContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  color: ${(props) => props.theme.gray_1 || "#555"};
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Marker = React.memo(({ isAttended, isDiary }) => (
  <MarkerContainer>
    {isAttended && (
      <span style={{ fontSize: "0.8rem", display: "inline-block" }}>✅</span>
    )}
    {isDiary && (
      <span style={{ fontSize: "0.8rem", display: "inline-block" }}>💪</span>
    )}
  </MarkerContainer>
));

// 수정된 WorkoutCalendar 컴포넌트
const WorkoutCalendar = ({
  onDateSelect,
  selectedDate,
  diaryDates = [],
  streakSegments = [],
  onMonthChange, // 부모에서 전달하는 달 변경 콜백
}) => {
  const [value, setValue] = useState(selectedDate || new Date());
  const [activeDate, setActiveDate] = useState(selectedDate || new Date());
  // 현재 달의 시작과 종료 날짜
  const [currentViewDates, setCurrentViewDates] = useState({
    start: null,
    end: null,
  });

  // 마운트 시 activeDate를 기준으로 currentViewDates 설정 (한 번만 실행)
  useEffect(() => {
    const start = moment(activeDate).startOf("month").format("YYYY-MM-DD");
    const end = moment(activeDate).endOf("month").format("YYYY-MM-DD");
    setCurrentViewDates({ start, end });
    if (onMonthChange) {
      const newYear = moment(activeDate).year();
      const newMonth = moment(activeDate).month() + 1; // month는 0부터 시작
      onMonthChange(newYear, newMonth);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 초기 한 번 실행

  // selectedDate 변경 시 value, activeDate 업데이트
  useEffect(() => {
    if (selectedDate) {
      setValue(selectedDate);
      setActiveDate(selectedDate);
    }
  }, [selectedDate]);

  // activeDate 변경 시, 새로 계산한 시작/종료 날짜와 기존이 다르면 업데이트
  useEffect(() => {
    const newStart = moment(activeDate).startOf("month").format("YYYY-MM-DD");
    const newEnd = moment(activeDate).endOf("month").format("YYYY-MM-DD");
    if (currentViewDates.start !== newStart || currentViewDates.end !== newEnd) {
      setCurrentViewDates({ start: newStart, end: newEnd });
      if (onMonthChange) {
        const newYear = moment(activeDate).year();
        const newMonth = moment(activeDate).month() + 1;
        onMonthChange(newYear, newMonth);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDate]);

  const handleActiveStartDateChange = ({ activeStartDate, view }) => {
    if (view === "month") {
      setActiveDate(activeStartDate);
    } else {
      setActiveDate(activeStartDate);
    }
  };

  const handleDateChange = useCallback(
    (newDate) => {
      setValue(newDate);
      setActiveDate(newDate);
      onDateSelect?.(newDate);
    },
    [onDateSelect]
  );

  // 현재 뷰의 월 내에 있는 날짜에 대해 마커를 표시
  const getAttendance = useCallback(
    (formatted) => {
      if (!currentViewDates.start || !currentViewDates.end) {
        return { isAttended: false, isDiary: false };
      }
      const dateToCheck = moment(formatted);
      const viewStart = moment(currentViewDates.start);
      const viewEnd = moment(currentViewDates.end);
      if (dateToCheck.isBetween(viewStart, viewEnd, "day", "[]")) {
        const segment = streakSegments.find(
          (seg) => formatted >= seg.start && formatted <= seg.end
        );
        return {
          isAttended: segment ? segment.attended.has(formatted) : false,
          isDiary: diaryDates.includes(formatted),
        };
      }
      return { isAttended: false, isDiary: false };
    },
    [streakSegments, diaryDates, currentViewDates]
  );

  const tileContent = useCallback(
    ({ date: tileDate, view }) => {
      if (view !== "month") return null;
      const formatted = moment(tileDate).format("YYYY-MM-DD");
      const { isAttended, isDiary } = getAttendance(formatted);
      if (!isAttended && !isDiary) return null;
      return <Marker isAttended={isAttended} isDiary={isDiary} />;
    },
    [getAttendance]
  );

  const tileClassName = useCallback(
    ({ date: tileDate }) => {
      return moment(tileDate).isSame(value, "day") ? "custom-selected-date" : "";
    },
    [value]
  );

  return (
    <StyledCalendarWrapper>
      <Calendar
        value={value}
        activeStartDate={activeDate}
        onChange={handleDateChange}
        onActiveStartDateChange={handleActiveStartDateChange}
        formatDay={(locale, date) => moment(date).format("D")}
        calendarType="gregory"
        showNeighboringMonth={false}
        next2Label={null}
        prev2Label={null}
        minDetail="year"
        tileContent={tileContent}
        tileClassName={tileClassName}
      />
      <LegendContainer>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span>✅</span>
          <span>출석</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span>💪</span>
          <span>일지</span>
        </div>
      </LegendContainer>
    </StyledCalendarWrapper>
  );
};

export default React.memo(WorkoutCalendar);
