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

// 페이지 전체 배경 컨테이너
const PageWrapper = styled.div`
  background-color: rgb(255, 255, 255);
  min-height: 100vh;
`;

export default function WorkoutPage() {
  const { user, setUser } = useUserStore();
  const { diaries, setDiaries } = useDiaryStore();
  const navigate = useNavigate();
  const location = useLocation();

  // 이전 페이지에서 전달된 성공 메시지 처리
  useEffect(() => {
    if (location.state && location.state.showSuccessMessage) {
      showSuccessAlert(location.state.showSuccessMessage);
    }
  }, [location]);

  // 선택한 날짜 (예: 2025-01-22)
  const [selectedDate, setSelectedDate] = useState(new Date());
  // 현재 조회할 달의 연도, 월 정보 (초기값은 selectedDate 기준)
  const [currentMonthYear, setCurrentMonthYear] = useState({
    year: moment(new Date()).year(),
    month: moment(new Date()).month() + 1,
  });
  const [filteredDiaries, setFilteredDiaries] = useState([]);
  const [diaryDates, setDiaryDates] = useState([]);
  const [streakSegments, setStreakSegments] = useState([]);

  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRefs = useRef({});

  // 삭제 확인 모달 state
  const [confirmDeleteDiaryId, setConfirmDeleteDiaryId] = useState(null);

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

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

  // 사용자 정보 및 현재 달의 데이터를 초기 로딩 시 함께 fetch
  useEffect(() => {
    async function fetchUserAndDiaries() {
      try {
        // 사용자 정보 fetch (이미 로컬에 있으면 바로 사용)
        let userData = user;
        if (!userData || !userData.userId) {
          userData = await getUser();
          setUser(userData);
        }
        // 현재 선택된 날짜에서 연도와 월을 추출 (초기값은 오늘)
        const year = moment(selectedDate).year();
        const month = moment(selectedDate).month() + 1;
        setCurrentMonthYear({ year, month });
        // 해당 월의 다이어리 데이터 fetch
        const diariesData = await getDiaries(userData.userId, year, month);
        const formattedDiaries = diariesData.map((d) => ({
          ...d,
          workoutDate: moment(d.workoutDate).format("YYYY-MM-DD"),
        }));
        setDiaries(formattedDiaries);
        setDiaryDates(
          Array.from(new Set(formattedDiaries.map((d) => d.workoutDate)))
        );
        // 출석 데이터도 fetch (현재 달 기준)
        const attendanceList = await getCurrentMonthAttendance(userData.userId);
        const attendanceDates = attendanceList.map((item) =>
          moment(item.attendanceDate).format("YYYY-MM-DD")
        );
        const segments = buildStreakSegments(attendanceDates);
        setStreakSegments(segments);
      } catch (error) {
        console.error("초기 데이터 로딩 오류:", error);
      }
    }
    fetchUserAndDiaries();
    // 의존성에 user가 없으면 매번 호출될 수 있으므로,
    // 최초 마운트 시 한 번 실행되도록 함
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 선택한 날짜(selectedDate)에 해당하는 다이어리만 필터링
  useEffect(() => {
    const formattedDate = moment(selectedDate).format("YYYY-MM-DD");
    setFilteredDiaries(
      diaries.filter((diary) => diary.workoutDate === formattedDate)
    );
  }, [diaries, selectedDate]);

  // 달력이 월이 바뀔 때 호출되는 콜백 (WorkoutCalendar에서 전달)
  const handleMonthChange = (year, month) => {
    setCurrentMonthYear({ year, month });
    // 달력이 월 변경될 때 새 데이터를 fetch합니다.
    async function fetchDiariesAndAttendance() {
      if (user && user.userId) {
        try {
          const diariesData = await getDiaries(user.userId, year, month);
          const formattedDiaries = diariesData.map((d) => ({
            ...d,
            workoutDate: moment(d.workoutDate).format("YYYY-MM-DD"),
          }));
          setDiaries(formattedDiaries);
          setDiaryDates(
            Array.from(new Set(formattedDiaries.map((d) => d.workoutDate)))
          );

          const attendanceList = await getCurrentMonthAttendance(user.userId);
          const attendanceDates = attendanceList.map((item) =>
            moment(item.attendanceDate).format("YYYY-MM-DD")
          );
          const segments = buildStreakSegments(attendanceDates);
          setStreakSegments(segments);
        } catch (error) {
          console.error("월 변경 시 데이터 로딩 오류:", error);
        }
      }
    }
    fetchDiariesAndAttendance();
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  // 삭제 확인 모달 "확인" 버튼 처리
  const confirmDelete = async () => {
    if (confirmDeleteDiaryId) {
      try {
        await deleteDiary(confirmDeleteDiaryId);
        setDiaries(diaries.filter((d) => d.diaryId !== confirmDeleteDiaryId));
      } catch (error) {
        console.error("삭제 중 오류:", error);
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
          onMonthChange={handleMonthChange} // 달력 월 변경 시 콜백 전달
        />

        {/* 다이어리 목록 영역 */}
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
          onClick={() =>
            navigate("/workoutcreate", { state: { selectedDate } })
          }
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
