import React, { useState, useEffect } from 'react';
import BottomBar from '../../components/bar/BottomBar';
import TopBar from '../../components/bar/TopBar';
import { useLocation } from 'react-router-dom';
import { getDiary } from '../../api/Diary';

export default function WorkoutDiaryPage() {
    const { diaryId } = useLocation().state || {};
    const [diary, setDiary] = useState({});

    useEffect(() => {
        getDiary(diaryId).then(fetchedDiary => {
            setDiary(fetchedDiary);
        });
    }, [diaryId]); 

    return (
        <>
        <TopBar/>
        <div>diaryId: {diaryId}</div>
        <div>User ID: {diary.userId}</div>
        <div>Workouts: {diary.diaryWorkouts?.map(workout => workout.name).join(', ')}</div>
        <BottomBar/>
        </>
    )
}