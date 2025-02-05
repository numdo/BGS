import React, { useEffect } from 'react';
import BottomBar from '../../components/bar/BottomBar';
import TopBar from '../../components/bar/TopBar';
import WorkoutCalendar from '../../components/workout/WorkoutCalendar';
import { useState } from 'react';
import { useLoaderData, useLocation, useNavigate } from 'react-router-dom';

import useDiaryStore from '../../stores/useDiaryStore';
import useUserStore from '../../stores/useUserStore';
import { deleteDiary, getDiaries } from '../../api/Diary';
export default function WorkoutPage() {
  const {user,setUser} = useUserStore()
  const [userId, setUserId] = useState("")
  const navigate = useNavigate()
  const { diaries, setDiaries } = useDiaryStore()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [filteredDiaries, setFilteredDiaries] = useState([])
  const state = useLocation().state
  useEffect(() => {
    if(!state){
      console.log("user.userId",user.userId)
      getDiaries(user.userId).then(diaries=>setDiaries(diaries))
    }
  }, [])
  useEffect(() => {
    console.log("filteredDiary 변경", filteredDiaries)
  }, [filteredDiaries])
  useEffect(() => {
    const formattedDate = selectedDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '-').replace('.', ''); // formattedDate 는 "2025-02-04" 형식
    setFilteredDiaries(diaries.filter((diary) => diary.workoutDate === formattedDate))
  }, [diaries, selectedDate])

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };
  const handleDeleteDiary = async (diaryId) => {
    try {
        await deleteDiary(diaryId)
        console.log("삭제 완료")
        setDiaries(diaries.filter(diary => diary.diaryId !== diaryId));
    } catch (error) {
        console.error("삭제 중 오류 발생:", error);
    }
};
  return (
    <>
      <TopBar />
      <div className='m-5'>
        <WorkoutCalendar onDateSelect={handleDateSelect} selectedDate={selectedDate} />
        <div className="space-y-4">
          {filteredDiaries.map((diary) => (
            <div
              key={diary.diaryId}
              className="p-4 bg-white rounded-lg border border-gray-200 max-w-md"
            >
              <div className="flex justify-between">
                <div onClick={()=>{navigate('/workoutdiary',{state:{diaryId:diary.diaryId}})}}>
                <p className="text-gray-600">{diary.content}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-auto py-2 border border-blue-300 rounded-md h-10 w-10"
                    onClick={() => { navigate('/workoutupdate', { state: { diaryId: diary.diaryId } }) }}
                  >
                    수정
                  </button>
                  <button
                    className="px-auto py-2 border border-red-300 rounded-md h-10 w-10"
                    onClick={() => { handleDeleteDiary(diary.diaryId) }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => { navigate('/workoutcreate') }}
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-100 font-bold py-3 px-6 rounded-full transition-all duration-300"
        >+ 운동일지 생성하기
        </button>
      </div>
      <BottomBar />
    </>
  );
};