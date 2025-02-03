import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRef } from 'react';
import BottomBar from '../components/BottomBar';
import TopBar from '../components/TopBar';
import selfie from './../assets/selfie.png';
export default function WorkoutCreatePage() {
  const [diary, setDiary] = useState(
    {
      "workoutDate": "2025-01-23",
      "content": "",
      "allowedScope": "string",
      "hashtags": ["운동일지", "헬스", "상체운동"],
      "diaryWorkouts": [
        {
          "workoutId": 1,
          "sets": [
            {
              "weight": 10,
              "repetition": 10,
              "workoutTime": 10
            },
            {
              "weight": 10,
              "repetition": 10,
              "workoutTime": 10
            },
            {
              "weight": 10,
              "repetition": 10,
              "workoutTime": 10
            }
          ]
        },
        {
          "workoutId": 2,
          "sets": [
            {
              "weight": 10,
              "repetition": 10,
              "workoutTime": 10
            },
            {
              "weight": 10,
              "repetition": 10,
              "workoutTime": 10
            }
          ]
        }
      ]
    }
  )
  const [workout, setWorkout] = useState(
    {
      "workoutId": 0,
      "setSum": 0,
      "deleted": true,
      "sets": []
    }
  )
  const [workoutSet, setWorkoutSet] = useState(
    {
      "weight": 0,
      "repeat": 0,
      "workoutTime": 0,
      "deleted": true
    }
  )
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(selfie);
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null)
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
  const addDiary = () => {
    setDiary({
      ...diary,
      workouts: [...diary.workouts, workout]
    })
    setWorkout({
      ...workout,
      sets: []
    })
    console.log(diary)
    console.log("다이어리 추가 기능 구현 예정")
  }
  const handleImageChange = (e) => {
    setFile(e.target.files[0]); // 사용자가 업로드한 파일
    console.log(file)
  };
  useEffect(() => {
    if (file) {
      const preview = URL.createObjectURL(file); // 이미지 미리보기 URL 생성
      setPreviewUrl(preview);
    }
  }, [file])
  const [accessLevel, setAccessLevel] = useState('public'); // 기본값은 '모두 공개'
  const accessToken = localStorage.getItem('accessToken');
  const handleDiarySubmit = (e) => {
    e.preventDefault()
    const formData = new FormData();
    const diaryJson = JSON.stringify(diary);
    const diaryBlob = new Blob([diaryJson], { type: 'application/json' });
    formData.append("diary", diaryBlob)
    formData.append("files", file)
    axios.post("https://i12c209.p.ssafy.io/api/diaries", formData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`, // Bearer 토큰 추가
      }
    }).then((response) => {
      console.log(response);
      console.log("저장성공")
    })
      .catch((error) => {
        console.log("error: ", error);
        alert('운동일지 저장에 실패했습니다.');
      });
  }
  return (
    <>
      <TopBar />
      <div className='m-5'>
        <form className='mb-4'>
          <label htmlFor="date">날짜 </label>
          <input
            type="date"
            id="date"
            name="date"
            value={diary.workoutDate}
            onChange={(e) => { setDiary({ ...diary, workoutDate: e.target.value }) }}
          />
        </form>
        <div className="mb-4">
          <div className="space-y-3">
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-gray-700 font-medium" htmlFor="weight">운동 종류</label>
                <input
                  type="number"
                  id="workout_id"
                  value={workout.workout_id}
                  onChange={(e) => setWorkout({ ...workout, workout_id: e.target.value, sets: [] })}
                  className="mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 w-full"
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-700 font-medium" htmlFor="weight">중량</label>
                <input
                  type="number"
                  id="weight"
                  value={workoutSet.weight}
                  onChange={(e) => setWorkoutSet({ ...workoutSet, weight: e.target.value })}
                  className="mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 w-full"
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-700 font-medium" htmlFor="repeat">횟수</label>
                <input
                  type="number"
                  id="repeat"
                  value={workoutSet.repeat}
                  onChange={(e) => setWorkoutSet({ ...workoutSet, repeat: e.target.value })}
                  className="mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 w-full"
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-700 font-medium" htmlFor="workout_time">운동시간</label>
                <input
                  type="number"
                  id="workout_time"
                  value={workoutSet.workout_time}
                  onChange={(e) => setWorkoutSet({ ...workoutSet, workout_time: e.target.value })}
                  className="mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 w-full"
                />
              </div>
            </div>
            {workout.sets.map((set, index) => (
              <div key={index}>
                <p>종류 : {workout.workout_id},세트 : {index + 1},무게 : {set.weight}kg,반복: {set.repeat}, 시간: {set.workout_time}s</p>
              </div>
            ))}
            <button
              onClick={addWorkoutSet}
              className="mt-4 w-full py-3 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 focus:outline-none"
            >
              세트 추가
            </button>
          </div>
        </div>
        <div className="mb-4">
          <textarea
            value={diary.content}
            onChange={(e) => setDiary({ ...diary, content: e.target.value })}
            placeholder="운동일지 내용을 작성하세요."
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>
        <div className="mb-5 max-w-md mx-auto mt-6 rounded-md">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                ref={fileInputRef}
              />
              <img
                src={previewUrl}
                alt="이미지 미리보기"
                className="w-40 h-40 object-cover rounded-md shadow-md cursor-pointer"
                onClick={() => {
                  fileInputRef.current.click(); // 파일 선택 창 열기
                }}
              />
            </div>
          </form>
        </div>
        <div className='mb-5'>
          <label htmlFor="access-level">공개범위 설정 </label>
          <select
            id="access-level"
            value={accessLevel}
            onChange={(e) => { setAccessLevel(e.target.value) }}
          >
            <option value="public">모두 공개</option>
            <option value="followers">팔로워한테만 공개</option>
            <option value="private">비공개</option>
          </select>
        </div>
        <button
          onClick={handleDiarySubmit}
          className="mb-20 w-full py-3 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 focus:outline-none "
        >
          저장
        </button>
      </div>
      <BottomBar />
    </>
  );
}
