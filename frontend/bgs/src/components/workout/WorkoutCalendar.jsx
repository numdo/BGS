import React, { useState, useCallback, useEffect } from "react";
import Calendar from "react-calendar";
import styled from "styled-components";
import moment from "moment";
import "react-calendar/dist/Calendar.css";

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

  /* 모든 타일의 기본 스타일 재설정 */
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

  /* 오늘 날짜 스타일 */
  .react-calendar__tile--now {
    background: none !important;
    abbr {
      color: ${(props) => props.theme.primary_2 || "#00acc1"};
    }
  }

  /* active 관련 모든 스타일 제거 */
  .react-calendar__tile--active,
  .react-calendar__tile--active:enabled:hover,
  .react-calendar__tile--active:enabled:focus,
  .react-calendar__tile--hasActive,
  .react-calendar__tile--hasActive:enabled:hover,
  .react-calendar__tile--hasActive:enabled:focus {
    background: none !important;
    color: inherit;
  }

  /* hover 스타일 */
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

  /* 선택된 날짜 스타일 */
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

// ... 나머지 코드는 동일 ...

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

const Marker = React.memo(({ isAttended, isDiary }) => (
  <MarkerContainer>
    {isAttended && (
      <span style={{ fontSize: "0.8rem", display: "inline-block" }}>
        ✅
      </span>
    )}
    {isDiary && (
      <span style={{ fontSize: "0.8rem", display: "inline-block" }}>
        💪
      </span>
    )}
  </MarkerContainer>
));

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

const WorkoutCalendar = ({
  onDateSelect,
  selectedDate,
  diaryDates = [],
  streakSegments = [],
}) => {
  const [value, setValue] = useState(selectedDate || new Date());
  const [activeDate, setActiveDate] = useState(selectedDate || new Date());

  useEffect(() => {
    if (selectedDate) {
      setValue(selectedDate);
      setActiveDate(selectedDate);
    }
  }, [selectedDate]);

  const handleDateChange = useCallback(
    (newDate) => {
      setValue(newDate);
      setActiveDate(newDate);
      onDateSelect?.(newDate);
    },
    [onDateSelect]
  );

  const getAttendance = useCallback(
    (formatted) => {
      const segment = streakSegments.find(
        (seg) => formatted >= seg.start && formatted <= seg.end
      );
      return {
        isAttended: segment ? segment.attended.has(formatted) : false,
        isDiary: diaryDates.includes(formatted),
      };
    },
    [streakSegments, diaryDates]
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
        formatDay={(locale, date) => moment(date).format("D")}
        calendarType="gregory"
        showNeighboringMonth={false}
        next2Label={null}
        prev2Label={null}
        minDetail="year"
        tileContent={tileContent}
        tileClassName={tileClassName}
        onActiveStartDateChange={({ activeStartDate }) => setActiveDate(activeStartDate)}
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