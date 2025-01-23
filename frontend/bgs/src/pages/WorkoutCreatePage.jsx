import React, { useState, useEffect } from 'react';
import BottomBar from '../components/BottomBar';
import TopBar from '../components/TopBar';

export default function WorkoutCreatePage() {
  const [diary, setDiary] = useState(
    {
      "user_id": 0,
      "content": "string",
      "workout_date": "2025-01-23",
      "allowed_scope": "string",
      "workouts": []
    }
  )
  const [workout, setWorkout] = useState(
    {
      "workout_id": 0,
      "set_sum": 0,
      "deleted": true,
      "sets": []
    }
  )
  const [workoutSet, setWorkoutSet] = useState(
    {
      "weight": 0,
      "repeat": 0,
      "workout_time": 0,
      "ordinal": 0,
      "deleted": true
    }
  )
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null);
  useEffect(() => {
    console.log("workout : ", workout);
  }, [workout]);

  useEffect(() => {
    console.log("workoutSet : ", workoutSet);
  }, [workoutSet]);

  useEffect(() => {
    console.log("diary : ", diary);
  }, [diary]);

  const addWorkoutSet = () => {
    setWorkout({
      ...workout,
      sets: [...workout.sets, workoutSet]
    })
  }
  const addWorkout = () => {
    setDiary({
      ...diary,
      workouts: [...diary.workouts, workout]
    })
    setWorkout({
      ...workout,
      sets: []
    })
  }
  const addDiary = () => {
    console.log(diary)
    console.log("다이어리 추가 기능 구현 예정")
  }
  const handleImageChange = (e) => {
    const file = e.target.files[0]; // 사용자가 업로드한 파일
    if (file) {
      setImageFile(file); // 상태에 파일 저장
      const preview = URL.createObjectURL(file);// 이미지 미리보기 URL 생성
      setPreviewUrl(preview);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (imageFile) {
      // 이미지 파일을 서버로 업로드하는 로직을 여기에 추가
      console.log('이미지 파일:', imageFile);
    } else {
      alert('이미지를 선택해주세요!');
    }
  };
  return (
    <>
      <TopBar />
      <h1 className="text-xl font-semibold text-center text-blue-600 mb-6">운동일지 작성 페이지</h1>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">운동 종류 입력</h2>
        <div className="flex-1">
          <label className="block text-gray-700 font-medium" htmlFor="weight">운동 종류</label>
          <input
            type="number"
            id="workout_id"
            value={workout.workout_id}
            onChange={(e) => setWorkout({ ...workout, workout_id: e.target.value, sets: [] })}
            className="mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>
      </div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">운동 세트 입력</h2>
        <div className="space-y-3">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-gray-700 font-medium" htmlFor="weight">Weight</label>
              <input
                type="number"
                id="weight"
                value={workoutSet.weight}
                onChange={(e) => setWorkoutSet({ ...workoutSet, weight: e.target.value })}
                className="mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 font-medium" htmlFor="repeat">Repeat</label>
              <input
                type="number"
                id="repeat"
                value={workoutSet.repeat}
                onChange={(e) => setWorkoutSet({ ...workoutSet, repeat: e.target.value })}
                className="mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 font-medium" htmlFor="workout_time">Workout Time</label>
              <input
                type="number"
                id="workout_time"
                value={workoutSet.workout_time}
                onChange={(e) => setWorkoutSet({ ...workoutSet, workout_time: e.target.value })}
                className="mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
          </div>
          <button
            onClick={addWorkoutSet}
            className="mt-4 w-full py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            세트 추가
          </button>
          {workout.sets.map((set, index) => (
            <div key={index}>
              <p>종류 : {workout.workout_id},세트 : {index + 1},무게 : {set.weight}kg,반복: {set.repeat}, 시간: {set.workout_time}s</p>
            </div>
          ))}
        </div>
      </div>

      {/* workout 입력 */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">운동 입력</h2>
        <button
          onClick={addWorkout}
          className="w-full py-3 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          운동 추가
        </button>
      </div>

      {/* 입력한 운동일지 보기 */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">운동일지 내용</h2>
        <textarea
          value={diary.content}
          onChange={(e) => setDiary({ ...diary, content: e.target.value })}
          placeholder="운동일지 내용을 작성하세요."
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800">등록된 운동들</h3>
          {diary.workouts.map((workout, index) => (
            <div key={index} className="mt-4 p-4 border border-gray-300 rounded-md">
              <h4 className="text-xl font-semibold text-gray-800">운동 {index + 1}</h4>
              {workout.sets.map((set, setIndex) => (
                <div key={setIndex} className="mt-2">
                  <p className="text-gray-700">세트 {setIndex + 1} - 무게: {set.weight}kg, 반복: {set.repeat}, 시간: {set.workout_time}s</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="max-w-md mx-auto mt-6 p-4 border border-gray-300 rounded-md shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">이미지 업로드</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
            />
          </div>
          {previewUrl && (
            <div className="mb-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-auto rounded-md shadow-md"
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            업로드
          </button>
        </form>
      </div>
      <button
        onClick={addDiary}
        className="mb-20 w-full py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        운동일지 추가
      </button>
      <BottomBar />
    </>
  );
}
