import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRef } from 'react';
import BottomBar from '../components/BottomBar';
import TopBar from '../components/TopBar';
import selfie from './../assets/selfie.png';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
export default function WorkoutCreatePage() {
    const navigate = useNavigate()
    const [diary, setDiary] = useState(
        {
            "workoutDate": "2025-02-04",
            "content": "",
            "allowedScope": "A",
            "hashtags": ["운동일지", "헬스", "상체운동"],
            "diaryWorkouts": []
        }
    )
    const location = useLocation()
    const diaryId = location.state.diaryId
    const accessToken = localStorage.getItem('accessToken');
    useEffect(() => {
        axios.get(`https://i12c209.p.ssafy.io/api/diaries/${diaryId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(res => {
            console.log("다이어리 불러오기 성공", res.data)
            setDiary({
                workoutDate: res.data.workoutDate,
                content: res.data.content,
                diaryId: res.data.diaryId,
                diaryWorkouts: res.data.diaryWorkouts,
                hashtags: res.data.hashtags,
                allowedScope: res.data.allowedScope,
                userId: 3
            })
            for (let index = 1; index <= res.data.diaryWorkouts.length; index++) {
                setInputs([...inputs, { weight: "", repetition: "", workoutTime: "" }])
            }
        }).catch(err => {
            console.log(err)
        })
    }, []);

    const [workoutId, setWorkoutId] = useState("")
    const [inputs, setInputs] = useState([{ weight: "", repetition: "", workoutTime: "" }])
    const [imageFile, setImageFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(selfie);
    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null)
    const [accessLevel, setAccessLevel] = useState('public'); // 기본값은 '모두 공개'
    useEffect(() => {
        console.log("inputs", inputs)
    }, [inputs])
    useEffect(() => {
        console.log("diary : ", diary);
    }, [diary]);
    const addWorkout = (workoutId) => {
        setInputs([...inputs, { weight: "", repetition: "", workoutTime: "" }])
        setDiary({
            ...diary,
            diaryWorkouts: [
                ...diary.diaryWorkouts,
                {
                    workoutId: workoutId,
                    sets: [{
                        "weight": 10,
                        "repetition": 10,
                        "workoutTime": 10
                    }]
                }
            ]
        })
    }
    const handleImageChange = (e) => {
        setFile(e.target.files[0]); // 사용자가 업로드한 파일
        console.log(file)
    };
    const handleAddSet = (indexOfWorkout) => {
        const newSets = diary.diaryWorkouts[indexOfWorkout].sets.concat({ "weight": inputs[indexOfWorkout].weight, "repetition": inputs[indexOfWorkout].repetition, "workoutTime": inputs[indexOfWorkout].workoutTime })
        const newWorkout = { ...diary.diaryWorkouts[indexOfWorkout], sets: newSets }
        const workouts = JSON.parse(JSON.stringify(diary.diaryWorkouts))
        workouts.splice(indexOfWorkout, 1, newWorkout)
        setDiary({ ...diary, diaryWorkouts: workouts })
    }
    const handleDeleteWorkout = (indexOfWorkout) => {
        setDiary({ ...diary, diaryWorkouts: diary.diaryWorkouts.filter((_, indOfWorkout) => indOfWorkout !== indexOfWorkout) })
        setInputs(inputs.slice(0, -1))
    }
    const handleDeleteSet = (indexOfWorkout, indexOfSet) => {
        const newSets = diary.diaryWorkouts[indexOfWorkout].sets.filter((_, indOfSet) => indOfSet !== indexOfSet)
        const newWorkout = { ...diary.diaryWorkouts[indexOfWorkout], sets: newSets }
        const workouts = JSON.parse(JSON.stringify(diary.diaryWorkouts))
        workouts.splice(indexOfWorkout, 1, newWorkout)
        setDiary({ ...diary, diaryWorkouts: workouts })
    }
    const handleInputChange = (index, field, value) => {
        const newInputs = [...inputs];
        newInputs[index][field] = value;
        setInputs(newInputs);
    };
    useEffect(() => {
        if (file) {
            const preview = URL.createObjectURL(file) // 이미지 미리보기 URL 생성
            setPreviewUrl(preview)
        }
    }, [file])
    const handleDiaryUpdate = (e) => {
        e.preventDefault()
        const formData = new FormData();
        const diaryJson = JSON.stringify(diary);
        const diaryBlob = new Blob([diaryJson], { type: 'application/json' });
        formData.append("diary", diaryBlob)
        formData.append("files", file)
        axios.patch(`https://i12c209.p.ssafy.io/api/diaries/${diaryId}`, formData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        }).then((response) => {
            console.log("운동일지 수정 성공", response)
            navigate("/workout")
        }).catch((error) => {
            console.log("운동일지 수정 실패", error)
        })
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
                        <div className="flex flex-row space-x-4">
                            <div className="flex-1 flex-row">
                                <label className="block text-gray-700 font-medium" htmlFor="weight">운동 종류</label>
                                <input
                                    type="number"
                                    id="workout_id"
                                    value={workoutId}
                                    placeholder='운동 종류'
                                    onChange={(e) => { setWorkoutId(e.target.value) }}
                                    className="mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                                />
                                <button
                                    onClick={() => { addWorkout(workoutId) }}
                                    className="m-1 p-3 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 focus:outline-none"
                                >
                                    운동 추가
                                </button>
                            </div>
                        </div>
                        {diary.diaryWorkouts.map((workout, indexOfWorkout) => (
                            <div key={indexOfWorkout} className='border border-gray-300 rounded'>
                                <div className='flex'>
                                    <h2>운동{workout.workoutId}</h2>
                                    <button className='border border-red-300 rounded px-1 text-red-300'
                                        onClick={() => { handleDeleteWorkout(indexOfWorkout) }}>⨯</button>
                                </div>
                                {workout.sets.map((set, indexOfSet) => (
                                    <div key={indexOfSet} className='flex '>
                                        <div>
                                            무게:{set.weight}
                                        </div>
                                        <div>
                                            중량:{set.repetition}
                                        </div>
                                        <div>
                                            시간:{set.workoutTime}
                                        </div>
                                        <button className='border border-red-300 rounded px-1 text-red-300'
                                            onClick={() => { handleDeleteSet(indexOfWorkout, indexOfSet) }}>⨯</button>
                                    </div>
                                ))}
                                <div className='flex'>
                                    <input
                                        type="number"
                                        placeholder='무게'
                                        value={inputs[indexOfWorkout].weight}
                                        onChange={(e) => handleInputChange(indexOfWorkout, "weight", e.target.value)}
                                        className="border rounded w-10"
                                    />
                                    <input
                                        type="number"
                                        placeholder='중량'
                                        value={inputs[indexOfWorkout].repetition}
                                        onChange={(e) => handleInputChange(indexOfWorkout, "repetition", e.target.value)}
                                        className="border rounded w-10"
                                    />
                                    <input
                                        type="number"
                                        placeholder='시간'
                                        value={inputs[indexOfWorkout].workoutTime}
                                        onChange={(e) => handleInputChange(indexOfWorkout, "workoutTime", e.target.value)}
                                        className="border rounded w-10"
                                    />

                                    <button className='border border-blue-300 px-1 rounded text-blue-300'
                                        onClick={() => { handleAddSet(indexOfWorkout) }}
                                    >+</button>
                                </div>
                            </div>
                        ))}
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
                        value={diary.allowedScope}
                        onChange={(e) => { setDiary({ ...diary, allowedScope: e.target.value }) }}
                    >
                        <option value="A">모두 공개</option>
                        <option value="M">비공개</option>
                    </select>
                </div>
                <button
                    onClick={handleDiaryUpdate}
                    className="mb-20 w-full py-3 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 focus:outline-none "
                >
                    수정
                </button>
            </div>
            <BottomBar />
        </>
    );
}
