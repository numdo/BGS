import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import TopBar from "../../components/bar/TopBar";
import BottomBar from "../../components/bar/BottomBar";
import WorkoutCalendar from "../../components/workout/WorkoutCalendar";
import MoreIcon from "../../assets/icons/more.svg";
import useDiaryStore from "../../stores/useDiaryStore";
import useUserStore from "../../stores/useUserStore";
import { deleteDiary, getDiaries } from "../../api/Diary";
import { getUser } from "../../api/User";
import { getCurrentMonthAttendance } from "../../api/Attendance";
import { buildStreakSegments } from "../../utils/streakUtil";
import DeleteConfirmAlert from "../../components/common/DeleteConfirmAlert";
import { showSuccessAlert } from "../../utils/toastrAlert";
import moment from "moment";

const PageWrapper = styled.div`
  background-color: rgb(255, 255, 255);
  min-height: 100vh;
`;

export default function WorkoutPage() {
  const { user, setUser } = useUserStore();
  const { diaries, setDiaries } = useDiaryStore();
  const navigate = useNavigate();
  const location = useLocation();

  // location.state를 중복 처리하지 않도록 하는 플래그
  const hasProcessedLocation = useRef(false);

  /**
   *  1) localStorage에서 이전에 저장한 selectedDate가 있으면 그걸 사용
   *     없으면 오늘 날짜를 기본값으로 사용
   */
  const [selectedDate, setSelectedDate] = useState(() => {
    const saved = localStorage.getItem("mySelectedDate");
    if (saved) {
      return new Date(saved); // 저장된 문자열(ISO 포맷)을 Date 객체로 변환
    }
    return new Date();
  });

  // 달력의 월/년
  const [currentMonthYear, setCurrentMonthYear] = useState({
    year: moment(selectedDate).year(),
    month: moment(selectedDate).month() + 1,
  });

  const [filteredDiaries, setFilteredDiaries] = useState([]);
  const [diaryDates, setDiaryDates] = useState([]);
  const [streakSegments, setStreakSegments] = useState([]);

  // 드롭다운
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRefs = useRef({});

  // 삭제 모달
  const [confirmDeleteDiaryId, setConfirmDeleteDiaryId] = useState(null);

  /**
   *  2) location.state.selectedDate가 있으면 한 번만 처리
   *     (예: WorkoutCreatePage에서 navigate("/workout",{state:{selectedDate}}) 로 넘어온 경우)
   *     이 때도 localStorage에 저장해둬야 뒤로가기로 마운트 시 재사용 가능
   */
  useEffect(() => {
    if (!hasProcessedLocation.current && location.state) {
      if (location.state.showSuccessMessage) {
        showSuccessAlert(location.state.showSuccessMessage);
      }
      // 만약 날짜가 넘어왔다면 적용
      if (location.state.selectedDate) {
        const newDate = new Date(location.state.selectedDate);
        setSelectedDate(newDate);
        localStorage.setItem("mySelectedDate", newDate.toISOString());
      }
      hasProcessedLocation.current = true;
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  /**
   *  3) selectedDate가 바뀔 때마다 localStorage에도 저장
   *     -> 뒤로가기 시 컴포넌트가 언마운트되어도, 다음 마운트 시 다시 불러올 수 있음
   */
  useEffect(() => {
    localStorage.setItem("mySelectedDate", selectedDate.toISOString());
  }, [selectedDate]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId && dropdownRefs.current[openDropdownId]) {
        if (!dropdownRefs.current[openDropdownId].contains(event.target)) {
          setOpenDropdownId(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [openDropdownId]);

  /**
   *  4) 사용자 정보 + 달력 표시용 다이어리 목록/출석 한 번에 fetch
   *     (selectedDate의 연/월을 기준)
   */
  useEffect(() => {
    async function fetchUserAndDiaries() {
      try {
        let userData = user;
        if (!userData || !userData.userId) {
          userData = await getUser();
          setUser(userData);
        }
        const year = moment(selectedDate).year();
        const month = moment(selectedDate).month() + 1;
        setCurrentMonthYear({ year, month });

        // 다이어리 목록 fetch
        const diariesData = await getDiaries(userData.userId, year, month);
        const formatted = diariesData.map((d) => ({
          ...d,
          workoutDate: moment(d.workoutDate).format("YYYY-MM-DD"),
        }));
        setDiaries(formatted);

        // 달력의 "운동일지 있는 날짜"
        setDiaryDates(Array.from(new Set(formatted.map((d) => d.workoutDate))));

        // 출석 streak
        const attendanceList = await getCurrentMonthAttendance(userData.userId);
        const attendanceDates = attendanceList.map((item) =>
          moment(item.attendanceDate).format("YYYY-MM-DD")
        );
        setStreakSegments(buildStreakSegments(attendanceDates));
      } catch (error) {
        console.error("데이터 로딩 오류:", error);
      }
    }
    fetchUserAndDiaries();
  }, [selectedDate, user, setUser, setDiaries]);

  /**
   *  5) '선택한 날짜'에 해당하는 일지들만 필터링
   */
  useEffect(() => {
    const formatted = moment(selectedDate).format("YYYY-MM-DD");
    setFilteredDiaries(diaries.filter((d) => d.workoutDate === formatted));
  }, [diaries, selectedDate]);

  // 달력이 월 변경
  const handleMonthChange = (year, month) => {
    setCurrentMonthYear({ year, month });
  };

  // 달력에서 날짜 선택 시
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  // 드롭다운 제어
  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  // 삭제 확인 모달
  // 수정된 confirmDelete 예시

const confirmDelete = async () => {
  if (confirmDeleteDiaryId) {
    try {
      // 1) 서버에 삭제 요청
      await deleteDiary(confirmDeleteDiaryId);

      // 2) 현재 diaries 상태에서 삭제된 일지 찾기
      const removedDiary = diaries.find((d) => d.diaryId === confirmDeleteDiaryId);

      // 3) 삭제된 일지를 제외한 새 목록
      const newDiaries = diaries.filter((d) => d.diaryId !== confirmDeleteDiaryId);

      // 4) diaries 상태 갱신
      setDiaries(newDiaries);

      // 5) 만약 해당 날짜에 더 이상 일지가 없다면 diaryDates에서 제거
      if (removedDiary) {
        const removedDate = removedDiary.workoutDate; // "YYYY-MM-DD" 형식
        const stillExist = newDiaries.some(d => d.workoutDate === removedDate);

        // 해당 날짜가 더 이상 없으면 diaryDates에서도 제거
        if (!stillExist) {
          setDiaryDates((prevDates) =>
            prevDates.filter((date) => date !== removedDate)
          );
        }
      }
    } catch (error) {
      console.error("삭제 오류:", error);
    } finally {
      setConfirmDeleteDiaryId(null);
    }
  }
};


  return (
    <PageWrapper>
      <TopBar />
      <div className="m-5">
        <WorkoutCalendar
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
          diaryDates={diaryDates}
          streakSegments={streakSegments}
          onMonthChange={handleMonthChange}
        />

        {/* 다이어리 목록 */}
        <div className="space-y-5 mt-4">
          {filteredDiaries.length > 0 ? (
            filteredDiaries.map((diary) => (
              <div
                key={diary.diaryId}
                onClick={() => navigate(`/workoutdiary/${diary.diaryId}`)}
                className="p-5 bg-white rounded-xl shadow-md border border-gray w-full max-w-lg mx-auto hover:shadow-xl transition duration-300 cursor-pointer"
              >
                <p className="text-sm text-gray-500 mb-1">운동일지</p>
                <p className="text-gray-800 text-base font-medium">
                  {diary.content}
                </p>
                <div className="flex justify-end mt-2">
                  <div
                    className="relative"
                    ref={(el) => (dropdownRefs.current[diary.diaryId] = el)}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(diary.diaryId);
                      }}
                      className="p-3 bg-gray-50 rounded-full hover:bg-gray-100"
                    >
                      <img src={MoreIcon} alt="더보기" className="w-8 h-8" />
                    </button>
                    {openDropdownId === diary.diaryId && (
                      <div className="absolute right-0 mt-2 w-40 bg-white rounded-md border shadow-md z-10 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/workoutupdate/${diary.diaryId}`);
                          }}
                          className="block w-full px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        >
                          수정
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteDiaryId(diary.diaryId);
                          }}
                          className="block w-full px-4 py-2 text-red-600 hover:bg-red-50"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">
              선택한 날짜에 운동일지가 없습니다.
            </p>
          )}
        </div>

        <div className="w-full h-32"></div>
        <button
          onClick={() => navigate("/workoutcreate", { state: { selectedDate } })}
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-[#5968eb] text-white font-bold py-3 px-6 rounded-full transition-all duration-300"
        >
          운동 기록하기
        </button>
      </div>
      <BottomBar />

      {/* 삭제 확인 모달 */}
      {confirmDeleteDiaryId && (
        <DeleteConfirmAlert
          message="정말로 삭제하시겠습니까?"
          onConfirm={confirmDelete}
          onCancel={() => setConfirmDeleteDiaryId(null)}
        />
      )}
    </PageWrapper>
  );
}
