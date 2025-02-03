import React, { useEffect } from 'react';
import BottomBar from '../components/BottomBar';
import TopBar from '../components/TopBar';
import WorkoutCalendar from '../components/workout/WorkoutCalendar';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useDiaryStore from '../stores/useDiaryStore';
export default function WorkoutPage() {
  const { diaries, setDiaries } = useDiaryStore()
  useEffect(() => {
    setDiaries(3)
  }, [])
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 0, 23))
  const [filteredDiaries, setFilteredDiaries] = useState([])
  useEffect(() => {
    setFilteredDiaries(diaries.filter((diary) => diary.workout_date.getTime() === selectedDate.getTime()))
  }, [diaries, selectedDate])

  useEffect(() => {
    console.log(filteredDiaries)
  }, [filteredDiaries])

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };
  const navigate = useNavigate()
  return (
    <>
      <TopBar />
      <WorkoutCalendar onDateSelect={handleDateSelect} selectedDate={selectedDate} />
      <div className="space-y-4">
        {filteredDiaries.map((diary) => (
          <div
            key={diary.id}
            className="p-4 bg-white rounded-lg shadow-md border border-gray-200"
          >
            <p className="text-lg font-semibold text-gray-800">
              {diary.user_id}의 다이어리
            </p>
            <p className="text-gray-600 mt-2">내용: {diary.content}</p>
          </div>
        ))}
      </div>
      <button
        onClick={() => { navigate('/workoutcreate') }}
        className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-100 font-bold py-3 px-6 rounded-full transition-all duration-300"
      >+ 운동일지 생성하기
      </button>
      <div>
        {diaries.map((diary) => (
          <div>
            {diary.workoutDate} {diary.content}
          </div>
        ))}
      </div>
      <BottomBar />
    </>
  );
};