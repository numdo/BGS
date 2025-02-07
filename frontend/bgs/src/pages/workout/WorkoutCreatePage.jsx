import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import BottomBar from '../../components/bar/BottomBar';
import TopBar from '../../components/bar/TopBar';
import selfie from '../../assets/images/selfie.png';
import { useNavigate } from 'react-router-dom';

export default function WorkoutCreatePage() {
  const navigate = useNavigate();

  // -----------------------------
  // 1) 운동일지 상태
  // -----------------------------
  const [diary, setDiary] = useState({
    workoutDate: new Date().toISOString().split('T')[0],
    content: '',
    allowedScope: 'A',
    hashtags: [],
    diaryWorkouts: [],  // { workoutId, sets: [{weight, repetition, ...}, ...] }
  });

  // -----------------------------
  // 2) 운동 목록 및 검색/필터
  // -----------------------------
  const [allWorkoutList, setAllWorkoutList] = useState([]); // 전체 운동 목록
  const [workoutList, setWorkoutList] = useState([]);       // 검색/필터 적용된 목록
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedPartFilter, setSelectedPartFilter] = useState('');
  const [selectedToolFilter, setSelectedToolFilter] = useState('');

  // -----------------------------
  // 3) 이전 기록, 최근 운동 목록
  // -----------------------------
  // - 이전 기록: 같은 날짜/다이어리에 속한 여러 운동을 "workoutIds"로 묶어 줌 (백엔드에서)
  //   [{ diaryId, workoutDate, workoutIds, workoutNames }, ...]
  // - 최근 운동: 단일 운동 기준 [{ diaryWorkoutId, workoutId, workoutName, tool }, ...]
  // -----------------------------
  const [previousRecords, setPreviousRecords] = useState([]);
  const [recentExercises, setRecentExercises] = useState([]);

  // -----------------------------
  // 4) 모달 상태
  // -----------------------------
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [isPreviousModalOpen, setIsPreviousModalOpen] = useState(false);

  // 운동 추가 모달에서 선택된 운동 ID들
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);

  // "최근 운동 보기" 토글
  const [showRecentExercises, setShowRecentExercises] = useState(false);

  // -----------------------------
  // 5) 이미지 업로드
  // -----------------------------
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(selfie);
  const fileInputRef = useRef(null);

  // -----------------------------
  // 6) 음성 녹음 관련
  // -----------------------------
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunksRef = useRef([]);
  const [recordStartTime, setRecordStartTime] = useState(0);

  // -----------------------------
  // 7) 기타
  // -----------------------------
  const [isLoading, setIsLoading] = useState(false);
  const [newHashtag, setNewHashtag] = useState('');

  // -----------------------------
  // 8) 초기 데이터 로딩 (운동 목록, 이전 기록, 최근 운동)
  // -----------------------------
  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    // (1) 전체 운동 목록
    axios
      .get('http://localhost:8080/api/diaries/workout', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })
      .then((res) => {
        setAllWorkoutList(res.data);
        setWorkoutList(res.data);
      })
      .catch((err) => console.error('🚨 운동 목록 불러오기 실패:', err));

    // (2) 이전 기록 (최대 5개) - 여러 운동이 묶여 있음 (workoutIds)
    axios
      .get('http://localhost:8080/api/diaries/workout/previous?limit=5', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })
      .then((res) => setPreviousRecords(res.data))
      .catch((err) => console.error('🚨 이전 기록 불러오기 실패:', err));

    // (3) 최근 운동 (최대 20개) - 단일 운동 기준
    axios
      .get('http://localhost:8080/api/diaries/workout/recent?limit=20', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })
      .then((res) => setRecentExercises(res.data))
      .catch((err) => console.error('🚨 최근 운동 불러오기 실패:', err));
  }, []);

  // -----------------------------
  // 9) 운동 목록 필터링 + 검색
  // -----------------------------
  const filteredWorkoutList = workoutList.filter((workout) => {
    const matchPart = selectedPartFilter === '' || workout.part === selectedPartFilter;
    const matchTool = selectedToolFilter === '' || workout.tool === selectedToolFilter;
    return matchPart && matchTool;
  });

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    if (keyword.trim() === '') {
      setWorkoutList(allWorkoutList);
    } else {
      const lower = keyword.toLowerCase();
      const filtered = allWorkoutList.filter((w) =>
        w.workoutName.toLowerCase().includes(lower)
      );
      setWorkoutList(filtered);
    }
  };

  // -----------------------------
  // 10) 모달 열기/닫기
  // -----------------------------
  const openExerciseModal = () => setIsExerciseModalOpen(true);
  const closeExerciseModal = () => setIsExerciseModalOpen(false);

  const openPreviousModal = () => setIsPreviousModalOpen(true);
  const closePreviousModal = () => setIsPreviousModalOpen(false);

  const toggleRecentExercises = () => setShowRecentExercises((prev) => !prev);

  // -----------------------------
  // 11) 운동 추가 모달에서 운동 선택
  // -----------------------------
  const toggleSelectedWorkout = (workoutId) => {
    setSelectedWorkouts((prevSelected) =>
      prevSelected.includes(workoutId)
        ? prevSelected.filter((id) => id !== workoutId)
        : [...prevSelected, workoutId]
    );
  };

  const handleWorkoutSelection = () => {
    if (selectedWorkouts.length === 0) {
      alert('운동을 하나 이상 선택해주세요!');
      return;
    }
    setDiary((prevDiary) => {
      const updated = [...prevDiary.diaryWorkouts];
      selectedWorkouts.forEach((wid) => {
        const existingIndex = updated.findIndex((dw) => dw.workoutId === wid);
        if (existingIndex !== -1) {
          // 이미 동일 운동 있다면 세트만 추가
          updated[existingIndex].sets.push({ weight: 10, repetition: 10, workoutTime: 10 });
        } else {
          // 새 운동 추가
          updated.push({
            workoutId: wid,
            sets: [{ weight: 10, repetition: 10, workoutTime: 10 }],
          });
        }
      });
      return { ...prevDiary, diaryWorkouts: updated };
    });
    setSelectedWorkouts([]);
    closeExerciseModal();
  };

  // -----------------------------
  // 12) 이전 기록 / 최근 운동 클릭 -> 여러 운동 추가
  // -----------------------------
  // 예시: previousRecords = [
//   { diaryId:10, workoutDate:'2025-02-07', workoutIds:[1,3], workoutNames:'벤치프레스, 디클라인 벤치 프레스' },
//   ...
// ]
// record: 이전 기록(또는 최근 운동) 객체
//   - record.workoutIds?: number[]    // 여러 운동 ID가 묶여 있을 수 있음
//   - record.workoutNames?: string    // "벤치프레스, 디클라인 벤치 프레스" 등

function handleAddRecord(record) {
  setDiary((prevDiary) => {
    const newDiaryWorkouts = [...prevDiary.diaryWorkouts];

    // 중복 ID 제거
    let workoutIdList = record.workoutIds?.length
      ? record.workoutIds
      : [record.workoutId];

    // 중복 제거
    workoutIdList = Array.from(new Set(workoutIdList));

    workoutIdList.forEach((wid) => {
      const existingIndex = newDiaryWorkouts.findIndex((dw) => dw.workoutId === wid);
      if (existingIndex !== -1) {
        // 이미 있으면 세트만 추가
        newDiaryWorkouts[existingIndex].sets.push({
          weight: 10, repetition: 10, workoutTime: 10,
        });
      } else {
        // 없으면 새 운동
        newDiaryWorkouts.push({
          workoutId: wid,
          sets: [{ weight: 10, repetition: 10, workoutTime: 10 }],
        });
      }
    });

    return { ...prevDiary, diaryWorkouts: newDiaryWorkouts };
  });

  alert(`${record.workoutNames || record.workoutName} 추가완료`);
  closePreviousModal();
}



  // -----------------------------
  // 13) 음성 녹음
  // -----------------------------
  const handleRecordButton = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 48000,
            channelCount: 1,
            noiseSuppression: true,
            echoCancellation: true,
          },
        });
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
        audioChunksRef.current = [];
        setRecordStartTime(Date.now());

        recorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const duration = Date.now() - recordStartTime;
          if (duration < 2000 || audioBlob.size < 5000) {
            console.error('녹음이 너무 짧습니다.');
            return;
          }
          setIsLoading(true);
          try {
            const formData = new FormData();
            formData.append('userId', 1);
            formData.append('audioFile', audioBlob);

            const response = await axios.post(
              'http://localhost:8080/api/ai-diary/auto',
              formData,
              { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            // 서버에서 받은 diaryWorkouts를 병합
            setDiary((prevDiary) => ({
              ...prevDiary,
              diaryWorkouts: [...prevDiary.diaryWorkouts, ...(response.data.diaryWorkouts || [])],
            }));
          } catch (err) {
            console.error('음성 처리 실패:', err);
          }
          setIsLoading(false);
        };

        recorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error('마이크 접근 오류:', error);
      }
    } else {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // -----------------------------
  // 14) 운동 삭제, 세트 추가/삭제/수정
  // -----------------------------
  const handleDeleteWorkout = (index) => {
    setDiary((prevDiary) => ({
      ...prevDiary,
      diaryWorkouts: prevDiary.diaryWorkouts.filter((_, i) => i !== index),
    }));
  };

  const handleAddSet = (workoutIndex) => {
    setDiary((prevDiary) => {
      const updated = [...prevDiary.diaryWorkouts];
      updated[workoutIndex] = {
        ...updated[workoutIndex],
        sets: [...updated[workoutIndex].sets, { weight: 10, repetition: 10, workoutTime: 10 }],
      };
      return { ...prevDiary, diaryWorkouts: updated };
    });
  };

  const handleDeleteSet = (workoutIndex, setIndex) => {
    setDiary((prevDiary) => {
      const updated = [...prevDiary.diaryWorkouts];
      updated[workoutIndex] = {
        ...updated[workoutIndex],
        sets: updated[workoutIndex].sets.filter((_, i) => i !== setIndex),
      };
      return { ...prevDiary, diaryWorkouts: updated };
    });
  };

  const handleWorkoutSetChange = (workoutIndex, setIndex, field, value) => {
    setDiary((prevDiary) => {
      const updated = [...prevDiary.diaryWorkouts];
      updated[workoutIndex] = {
        ...updated[workoutIndex],
        sets: updated[workoutIndex].sets.map((s, i) => {
          if (i === setIndex) {
            return { ...s, [field]: Number(value) };
          }
          return s;
        }),
      };
      return { ...prevDiary, diaryWorkouts: updated };
    });
  };

  // -----------------------------
  // 15) 이미지 업로드
  // -----------------------------
  const handleImageChange = (e) => {
    setFile(e.target.files[0]);
    const preview = URL.createObjectURL(e.target.files[0]);
    setPreviewUrl(preview);
  };

  // -----------------------------
  // 16) 운동일지 저장
  // -----------------------------
  const handleDiarySubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    const formData = new FormData();
    formData.append('diary', new Blob([JSON.stringify(diary)], { type: 'application/json' }));
    if (file) {
      formData.append('files', file);
    }
    try {
      await axios.post('http://localhost:8080/api/diaries', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      alert('✅ 운동 데이터 저장 완료!');
      navigate('/workout');
    } catch (error) {
      console.error('❌ 저장 오류:', error);
      if (error.response && error.response.status === 401) {
        alert('로그인이 필요합니다.');
        navigate('/login');
      } else {
        alert('🚨 저장 실패!');
      }
    }
    // 디버그용
    console.log(JSON.stringify(diary, null, 2));
  };

  // -----------------------------
  // 17) 해시태그 추가
  // -----------------------------
  const handleAddHashtag = () => {
    if (newHashtag.trim() && !diary.hashtags.includes(newHashtag.trim())) {
      setDiary((prev) => ({
        ...prev,
        hashtags: [...prev.hashtags, newHashtag.trim()],
      }));
      setNewHashtag('');
    }
  };

  // -----------------------------
  // 18) workoutId -> 운동 이름
  // -----------------------------
  const getWorkoutName = (workoutId) => {
    const w = allWorkoutList.find((x) => x.workoutId === workoutId);
    return w ? w.workoutName : `운동ID-${workoutId}`;
  };

  // -----------------------------
  // 실제 렌더링
  // -----------------------------
  return (
    <>
      <TopBar />
      <div className="m-5 pb-24">
        {/* 날짜 입력 */}
        <div>
          <label htmlFor="date">날짜: </label>
          <input
            type="date"
            id="date"
            value={diary.workoutDate}
            onChange={(e) => setDiary({ ...diary, workoutDate: e.target.value })}
          />
        </div>

        {/* 상단 버튼 영역 */}
        <div className="flex items-center space-x-4 mt-4">
          <button onClick={openExerciseModal} className="w-1/3 p-2 bg-gray-500 text-white rounded">
            🏋️‍♂️ 운동 추가
          </button>
          <button onClick={handleRecordButton} className="w-1/3 p-2 bg-blue-500 text-white rounded">
            {isRecording ? '⏹ 녹음 중...' : '🎤 음성 운동 추가'}
          </button>
          <button onClick={openPreviousModal} className="w-1/3 p-2 bg-green-500 text-white rounded">
            이전 기록 보기
          </button>
        </div>

        {/* 운동 추가 모달 */}
        {isExerciseModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-2xl w-full">
              <h2 className="text-xl font-bold mb-4">운동 추가하기</h2>

              {/* 부위 필터 */}
              <div className="mb-2">
                <span className="mr-2 font-semibold">부위: </span>
                <button
                  onClick={() => setSelectedPartFilter('')}
                  className={`mr-2 px-2 py-1 border rounded ${
                    selectedPartFilter === '' ? 'bg-blue-500 text-white' : ''
                  }`}
                >
                  전체
                </button>
                {[...new Set(allWorkoutList.map((w) => w.part))].map((part) => (
                  <button
                    key={`part-${part}`}
                    onClick={() => setSelectedPartFilter(part)}
                    className={`mr-2 px-2 py-1 border rounded ${
                      selectedPartFilter === part ? 'bg-blue-500 text-white' : ''
                    }`}
                  >
                    {part}
                  </button>
                ))}
              </div>

              {/* 기구 필터 */}
              <div className="mb-2">
                <span className="mr-2 font-semibold">기구: </span>
                <button
                  onClick={() => setSelectedToolFilter('')}
                  className={`mr-2 px-2 py-1 border rounded ${
                    selectedToolFilter === '' ? 'bg-blue-500 text-white' : ''
                  }`}
                >
                  전체
                </button>
                {[...new Set(allWorkoutList.map((w) => w.tool))].map((tool) => (
                  <button
                    key={`tool-${tool}`}
                    onClick={() => setSelectedToolFilter(tool)}
                    className={`mr-2 px-2 py-1 border rounded ${
                      selectedToolFilter === tool ? 'bg-blue-500 text-white' : ''
                    }`}
                  >
                    {tool}
                  </button>
                ))}
              </div>

              {/* 검색창 */}
              <input
                type="text"
                placeholder="추가하고 싶은 운동을 검색해보세요"
                className="w-full p-2 border rounded mb-4"
                value={searchKeyword}
                onChange={(e) => handleSearch(e.target.value)}
              />

              {/* 최근 운동 토글 */}
              <div className="mb-4">
                <button
                  onClick={toggleRecentExercises}
                  className="px-4 py-2 bg-purple-500 text-white rounded"
                >
                  {showRecentExercises ? '최근 운동 숨기기' : '최근 운동 보기'}
                </button>
              </div>

              {/* 최근 운동 (toggle) */}
              {showRecentExercises && (
                <div className="space-y-1 max-h-48 overflow-y-auto mb-4">
                  {recentExercises.map((exercise, idx) => (
                    <div
                      key={`recent-${exercise.diaryWorkoutId}-${idx}`}
                      className="p-2 border-b cursor-pointer"
                      onClick={() => handleAddRecord(exercise)}
                    >
                      <p className="text-sm">
                        {exercise.workoutName} ({exercise.tool})
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* 운동 목록 (필터 + 검색) */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredWorkoutList.map((workout) => (
                  <div
                    key={`w-${workout.workoutId}`}
                    className="flex justify-between items-center p-2 border rounded hover:bg-gray-100 cursor-pointer"
                    onClick={() => toggleSelectedWorkout(workout.workoutId)}
                  >
                    <div>
                      <p className="font-bold">{workout.workoutName}</p>
                      <p className="text-sm text-gray-600">
                        {workout.part} / {workout.tool}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedWorkouts.includes(workout.workoutId)}
                      readOnly
                    />
                  </div>
                ))}
              </div>

              {/* 하단 버튼 */}
              <div className="mt-4 flex justify-end space-x-2">
                <button onClick={closeExerciseModal} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                  취소
                </button>
                <button onClick={handleWorkoutSelection} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  추가 완료
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 이전 기록 모달 */}
        {isPreviousModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">이전 기록</h2>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {previousRecords.map((record, index) => (
                  <div
                    // diaryId를 key로 쓰거나, diaryId가 없다면 diaryWorkoutId + index 등
                    key={`prev-${record.diaryId || record.diaryWorkoutId}-${index}`}
                    className="p-2 border-b cursor-pointer"
                    onClick={() => handleAddRecord(record)}
                  >
                    {/* record.workoutNames를 이용해 여러 운동명 표시 */}
                    <p className="text-sm">
                      {record.workoutDate} - {record.workoutNames || record.workoutName}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <button onClick={closePreviousModal} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 추가된 운동 목록 */}
        <div className="mt-4">
          {diary.diaryWorkouts.map((workout, wIndex) => (
            <div key={`dw-${wIndex}`} className="border p-2 rounded mb-2">
              <div className="flex justify-between items-center">
                <h2>{getWorkoutName(workout.workoutId)}</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddSet(wIndex)}
                    className="px-2 py-1 bg-green-500 text-white rounded"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleDeleteWorkout(wIndex)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              {workout.sets.map((set, setIndex) => (
                <div key={`set-${wIndex}-${setIndex}`} className="flex items-center space-x-4 mt-2">
                  <div>
                    <label className="mr-1">무게:</label>
                    <input
                      type="number"
                      value={set.weight}
                      onChange={(e) => handleWorkoutSetChange(wIndex, setIndex, 'weight', e.target.value)}
                      className="w-20 p-1 border rounded"
                    />
                  </div>
                  <div>
                    <label className="mr-1">횟수:</label>
                    <input
                      type="number"
                      value={set.repetition}
                      onChange={(e) => handleWorkoutSetChange(wIndex, setIndex, 'repetition', e.target.value)}
                      className="w-20 p-1 border rounded"
                    />
                  </div>
                  <div>
                    <label className="mr-1">시간:</label>
                    <input
                      type="number"
                      value={set.workoutTime}
                      onChange={(e) => handleWorkoutSetChange(wIndex, setIndex, 'workoutTime', e.target.value)}
                      className="w-20 p-1 border rounded"
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteSet(wIndex, setIndex)}
                    className="px-2 py-1 bg-red-300 text-white rounded"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* 이미지 업로드 */}
        <div className="mt-4">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
          <img
            src={previewUrl}
            alt="이미지 미리보기"
            className="w-40 h-40 object-cover rounded-md shadow-md cursor-pointer"
            onClick={() => fileInputRef.current.click()}
          />
        </div>

        {/* 운동일지 내용 입력 */}
        <textarea
          className="w-full h-24 mt-4 p-2 border rounded"
          value={diary.content}
          onChange={(e) => setDiary({ ...diary, content: e.target.value })}
          placeholder="운동일지 내용을 입력하세요."
        />

        {/* 해시태그 입력 */}
        <div className="mt-4">
          <input
            type="text"
            className="p-2 border rounded"
            value={newHashtag}
            onChange={(e) => setNewHashtag(e.target.value)}
            placeholder="해시태그 입력"
          />
          <button
            onClick={handleAddHashtag}
            className="p-2 bg-blue-500 text-white rounded ml-2"
          >
            추가
          </button>
        </div>
        <div className="mt-2">
          {diary.hashtags.map((tag) => (
            <span key={tag} className="p-1 bg-gray-200 rounded-full text-sm mr-2">
              #{tag}
            </span>
          ))}
        </div>

        {/* 공개 범위 설정 */}
        <div className="mt-2">
          <select
            value={diary.allowedScope}
            onChange={(e) => setDiary({ ...diary, allowedScope: e.target.value })}
          >
            <option value="A">모두 공개</option>
            <option value="M">비공개</option>
          </select>
        </div>

        {/* 저장 버튼 */}
        <button onClick={handleDiarySubmit} className="mt-4 p-2 bg-gray-500 text-white rounded">
          저장
        </button>
      </div>
      <BottomBar />
    </>
  );
}
