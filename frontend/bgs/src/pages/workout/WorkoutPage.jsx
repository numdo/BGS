// src/pages/WorkoutPage.jsx
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

// 페이지 전체의 배경색을 설정하는 컨테이너
const PageWrapper = styled.div`
  background-color: rgb(255, 255, 255); /* 원하는 배경색으로 변경 */
  min-height: 100vh;
`;

export default function WorkoutPage() {
  const { user, setUser } = useUserStore();
  const { diaries, setDiaries } = useDiaryStore();
  const navigate = useNavigate();
  const location = useLocation();

  // 만약 이전 페이지(예: WorkoutCreatePage)에서 성공 메시지를 전달했다면 toastr 성공 알림 실행
  useEffect(() => {
    if (location.state && location.state.showSuccessMessage) {
      showSuccessAlert(location.state.showSuccessMessage);
      // 필요하다면 history.replace를 사용해 state를 제거할 수 있습니다.
    }
  }, [location]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredDiaries, setFilteredDiaries] = useState([]);
  const [diaryDates, setDiaryDates] = useState([]);
  const [streakSegments, setStreakSegments] = useState([]);

  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRefs = useRef({});

  // 삭제 확인 모달용 state
  const [confirmDeleteDiaryId, setConfirmDeleteDiaryId] = useState(null);

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  useEffect(() => {
    // 외부 클릭 시 드롭다운 닫기
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

  // 1) user, diaries, 출석 정보 fetch
  useEffect(() => {
    async function fetchData() {
      try {
        let userData = user;
        if (!userData || !userData.userId) {
          userData = await getUser();
          setUser(userData);
        }
        const diariesData = await getDiaries(userData.userId);
        setDiaries(diariesData);
        setDiaryDates(Array.from(new Set(diariesData.map((d) => d.workoutDate))));

        const attendanceList = await getCurrentMonthAttendance(userData.userId);
        const attendanceDates = attendanceList.map((item) => item.attendanceDate);
        const segments = buildStreakSegments(attendanceDates);
        setStreakSegments(segments);
      } catch (err) {
        console.error("데이터 불러오기 실패:", err);
      }
    }
    fetchData();
  }, [user, setUser, setDiaries]);

  // 2) 날짜 선택 시 일지 필터
  useEffect(() => {
    const formattedDate = selectedDate
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\. /g, "-")
      .replace(".", "");
    setFilteredDiaries(
      diaries.filter((diary) => diary.workoutDate === formattedDate)
    );
  }, [diaries, selectedDate]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  // 삭제 확인 모달에서 확인 버튼 클릭 시 처리
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
        />

        {/* 일지 목록 영역 */}
        <div className="space-y-5 mt-4">
          {filteredDiaries.length > 0 ? (
            filteredDiaries.map((diary) => (
              <div
                key={diary.diaryId}
                onClick={() => navigate(`/workoutdiary/${diary.diaryId}`)}
                className="p-5 bg-white rounded-xl shadow-md border border-gray w-full max-w-lg mx-auto hover:shadow-xl transition duration-300 cursor-pointer"
              >
                {/* 상단 제목 */}
                <p className="text-sm text-gray-500 mb-1">운동일지</p>
                {/* 내용 */}
                <p className="text-gray-800 text-base font-medium">{diary.content}</p>
                {/* 더보기 버튼 (카드 전체 클릭 이벤트 전파 방지) */}
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
