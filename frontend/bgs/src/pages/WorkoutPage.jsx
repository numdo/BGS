import React from 'react';
import BottomBar from '../components/BottomBar';
import TopBar from '../components/TopBar';
import WorkoutCalendar from '../components/workout/WorkoutCalendar';
import WorkoutDiary from '../components/workout/WorkoutDiary';
import { useState } from 'react';
export default function WorkoutPage() {
  const [selectedDate, setSelectedDate] = useState(null); // 선택한 날짜
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };
  return (
    <>
    <TopBar />
    <WorkoutCalendar onDateSelect={handleDateSelect} selectedDate={selectedDate}/>
    <WorkoutDiary selectedDate={selectedDate}/>
    <BottomBar />
    </>
  );
};