import React from 'react';

const WorkoutDiary = ({ selectedDate }) => {
  // 예시로 운동 일지 데이터
  const diaryEntries = [
    { date: new Date(2025, 0, 1), entry: '운동 1' },
    { date: new Date(2025, 0, 2), entry: '운동 2' },
    { date: new Date(2025, 0, 3), entry: '운동 3' },
    // 더 많은 데이터가 있을 수 있음
  ];

  // 선택된 날짜에 해당하는 일지를 필터링
  const filteredDiaryEntries = diaryEntries.filter(
    (entry) => selectedDate && entry.date.toDateString() === selectedDate.toDateString()
  );

  return (
    <div>
      <p>선택된 날짜:{selectedDate.toISOString().split('T')[0]}</p>
      <h2>Workout Diary</h2>
      {filteredDiaryEntries.length > 0 ? (
        filteredDiaryEntries.map((entry, index) => (
          <div key={index}>
            <p>{entry.entry}</p>
          </div>
        ))
      ) : (
        <p>선택된 날짜의 운동 일지가 없습니다.</p>
      )}
    </div>
  );
};

export default WorkoutDiary;