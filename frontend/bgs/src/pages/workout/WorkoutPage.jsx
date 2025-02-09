import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../../components/bar/TopBar';
import BottomBar from '../../components/bar/BottomBar';
import WorkoutCalendar from '../../components/workout/WorkoutCalendar';

import useDiaryStore from '../../stores/useDiaryStore';
import useUserStore from '../../stores/useUserStore';

import { deleteDiary, getDiaries } from '../../api/Diary';
import { getUser } from '../../api/User'; // ✅ user 정보를 가져오는 API


export default function WorkoutPage() {
  const { user, setUser } = useUserStore();
  const { diaries, setDiaries } = useDiaryStore();

  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredDiaries, setFilteredDiaries] = useState([]);
  const [diaryDates, setDiaryDates] = useState([]);

  useEffect(() => {
    async function fetchUserAndDiaries() {
      try {
        // 만약 user가 아직 없거나 user.userId가 없다면, 직접 getUser() 호출
        if (!user || !user.userId) {
          const userData = await getUser(); 
          setUser(userData);
          // userData.userId 기반으로 diaries fetch
          const diariesData = await getDiaries(userData.userId);
          setDiaries(diariesData);
          setDiaryDates(Array.from(new Set(diariesData.map(d => d.workoutDate))));
        } else {
          // 이미 user store에 user.userId가 있는 경우
          const diariesData = await getDiaries(user.userId);
          setDiaries(diariesData);
          setDiaryDates(Array.from(new Set(diariesData.map(d => d.workoutDate))));
        }
      } catch (err) {
        console.error('일지/유저 정보 불러오기 실패:', err);
      }
    }

    fetchUserAndDiaries();
  }, [user, setUser, setDiaries]);

  useEffect(() => {
    // "YYYY-MM-DD" 형식으로 변환
    const formattedDate = selectedDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '-').replace('.', '');

    setFilteredDiaries(diaries.filter((diary) => diary.workoutDate === formattedDate));
  }, [diaries, selectedDate]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleDeleteDiary = async (diaryId) => {
    try {
      await deleteDiary(diaryId);
      setDiaries(diaries.filter((d) => d.diaryId !== diaryId));
    } catch (error) {
      console.error('삭제 중 오류:', error);
    }
  };

  return (
    <>
      <TopBar />
      <div className="m-5">
        <WorkoutCalendar
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
          diaryDates={diaryDates}
        />
        <div className="space-y-4">
          {filteredDiaries.length > 0 ? (
            filteredDiaries.map((diary) => (
              <div
                key={diary.diaryId}
                className="p-4 bg-white rounded-lg border border-gray-200 max-w-md"
              >
                <div className="flex justify-between">
                  <div 
                    onClick={() =>
                      navigate('/workoutdiary', { state: { diaryId: diary.diaryId } })
                    }
                  >
                    <p className="text-gray-600">{diary.content}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="px-auto py-2 border border-blue-300 rounded-md h-10 w-10"
                      onClick={() =>
                        navigate(`/workoutupdate/${diary.diaryId}`) // ✅ URL에 diaryId 포함
                      }
                    >
                      수정
                    </button>
                    <button
                      className="px-auto py-2 border border-red-300 rounded-md h-10 w-10"
                      onClick={() => handleDeleteDiary(diary.diaryId)}
                    >
                      삭제
                    </button>
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
        <button
          onClick={() => navigate('/workoutcreate')}
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-100 font-bold py-3 px-6 rounded-full transition-all duration-300"
        >
          + 운동일지 생성하기
        </button>
      </div>
      <BottomBar />
    </>
  );
}
