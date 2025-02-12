import {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useMemo,
} from "react";
import { getAttendanceByRange, checkAttendance } from "../../api/Attendance";

const AttendanceGrid = forwardRef((props, ref) => {
  const [attendanceMap, setAttendanceMap] = useState({});
  // 컴포넌트 마운트 시점의 날짜를 한 번만 저장 (재렌더 시 바뀌지 않음)
  const [currentDate] = useState(new Date());
  const currentYear = useMemo(() => currentDate.getFullYear(), [currentDate]);

  const formatDate = (date) => date.toISOString().slice(0, 10);

  // 1월 1일 계산 (currentYear는 변하지 않음)
  const startOfYear = useMemo(() => new Date(currentYear, 0, 1), [currentYear]);
  const weeksInYear = useMemo(
    () =>
      Math.ceil(
        (new Date(currentYear, 11, 31) - startOfYear) /
          (7 * 24 * 60 * 60 * 1000)
      ),
    [currentYear, startOfYear]
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

  const weeks = useMemo(() => generateWeeks(), [startOfYear, weeksInYear]);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        // 시작일은 1월 1일, 종료일은 currentDate (마운트 시점)
        const startDateStr = formatDate(startOfYear);
        const currentDateStr = formatDate(currentDate);
        const data = await getAttendanceByRange(startDateStr, currentDateStr);
        // 반환받은 데이터를 날짜별로 매핑 (attendanceDate 속성이 "YYYY-MM-DD" 형식이라고 가정)
        const newMap = {};
        data.forEach((record) => {
          newMap[record.attendanceDate] = record;
        });
        setAttendanceMap(newMap);
      } catch (err) {
        console.error("출석 데이터 조회 실패:", err);
      }
    };
    fetchAttendanceData();
    // currentDate와 startOfYear는 한 번만 설정되므로, 이후 불필요한 호출이 발생하지 않습니다.
  }, [startOfYear, currentDate]);

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
          const response = await checkAttendance(attendanceData);

          // ✅ 출석 체크 성공 시 알림 표시
          alert("✅ 출석이 완료되었습니다!");

          // 출석 정보 상태 업데이트
          setAttendanceMap((prev) => ({ ...prev, [todayStr]: attendanceData }));
        } catch (err) {
          console.error("출석 체크 실패:", err);
          alert("❌ 출석 체크에 실패했습니다. 다시 시도해주세요.");
        }
      },
      (error) => {
        console.error("위치 정보를 가져오는데 실패했습니다.", error);
        alert("❌ 위치 정보를 가져오는데 실패했습니다.");
      }
    );
  };

  useImperativeHandle(ref, () => ({
    handleCheckAttendance,
  }));

  // 매 렌더마다 호출되는 getColorIntensity 함수는 예제용으로 랜덤 처리하고 있으나,
  // 매번 다른 값을 반환하지 않도록 하려면 별도로 메모이제이션하거나 실제 데이터를 기준으로 처리할 수 있습니다.
  const getColorIntensity = (date) => {
    const today = new Date();
    // 미래 날짜는 기본 색상(출석 아직 아님)
    if (date > today) return "#ebedf0";

    const dateStr = formatDate(date);

    // 출석 기록이 있으면 진한
    if (attendanceMap[dateStr]) return "#775a0b";

    // 출석 기록이 없는 날이면, 과거에 출석한 기록이 있는지 확인하여 연속 출석의 일부라면 연한 초록색으로 처리
    // attendanceMap의 key는 "YYYY-MM-DD" 형식이므로 ISO 형식으로 정렬하면 날짜 순서가 유지됩니다.
    const attendedDates = Object.keys(attendanceMap).sort(); // 오름차순 정렬
    let previousAttended = null;
    for (let i = 0; i < attendedDates.length; i++) {
      // 날짜 문자열 비교는 ISO 형식에서 올바르게 작동합니다.
      if (attendedDates[i] < dateStr) {
        previousAttended = attendedDates[i];
      } else {
        break;
      }
    }

    // 만약 이전에 출석한 날이 있다면, 그 날과의 차이를 계산
    if (previousAttended) {
      const prevDate = new Date(previousAttended);
      // 일수 차이 계산 (정수)
      const gap = Math.floor((date - prevDate) / (1000 * 60 * 60 * 24));
      // gap이 1 또는 2라면(즉, 3일 이상 결석 전까지는 연속 출석으로 간주)
      if (gap > 0 && gap < 3) {
        return "#ceb71b"; // 연한
      }
    }

    // 기본 색상 (출석 기록도 없고 연속 출석 범위에 속하지 않음)
    return "#ebedf0";
  };

  return (
    <div
      className="overflow-x-auto w-full px-4"
      style={{ whiteSpace: "nowrap" }}
    >
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
              gridTemplateColumns: `repeat(${weeks.length}, 14px)`,
              gridTemplateRows: "repeat(7, 14px)",
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
            {["#ebedf0", "#e8d98d", "#ceb71b", "#ac9314", "#775a0b"].map(
              (color, index) => (
                <div
                  key={index}
                  style={{
                    width: "14px",
                    height: "14px",
                    backgroundColor: color,
                    marginLeft: "2px",
                    borderRadius: "2px",
                  }}
                ></div>
              )
            )}
          </div>
          <span className="ml-2">More</span>
        </div>
      </div>
    </div>
  );
});

AttendanceGrid.displayName = "AttendanceGrid";
export default AttendanceGrid;
