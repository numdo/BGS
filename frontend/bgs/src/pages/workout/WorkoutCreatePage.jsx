import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import BottomBar from '../../components/bar/BottomBar';
import TopBar from '../../components/bar/TopBar';
import selfie from '../../assets/images/selfie.png';
import { useNavigate } from 'react-router-dom';

export default function WorkoutCreatePage() {
  const navigate = useNavigate();

  // 📝 일지 정보
  const [diary, setDiary] = useState({
    workoutDate: new Date().toISOString().split('T')[0],
    content: '',
    allowedScope: 'A',
    hashtags: [],
    diaryWorkouts: [],
  });

  // 📋 운동 목록 (전체와 검색결과를 분리)
  const [allWorkoutList, setAllWorkoutList] = useState([]); // 전체 목록 저장
  const [workoutList, setWorkoutList] = useState([]); // 현재 보여줄 목록

  // 이전 기록 및 최근 운동 상태 (API에서 받아옴, 각각 최대5개, 20개)
  const [previousRecords, setPreviousRecords] = useState([]);
  const [recentExercises, setRecentExercises] = useState([]);

  // 📸 이미지 업로드 관련
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(selfie);
  const fileInputRef = useRef(null);

  // 🏋️‍♂️ 모달 관련
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 다중 선택을 위해 배열로 관리
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 추가: 필터링 state (부위, 기구)
  const [selectedPartFilter, setSelectedPartFilter] = useState('');
  const [selectedToolFilter, setSelectedToolFilter] = useState('');

  // 🎙️ 녹음 관련
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  // audioChunks를 ref로 관리하여 이전 녹음 데이터 누적 방지
  const audioChunksRef = useRef([]);
  const [recordStartTime, setRecordStartTime] = useState(0);

  // 🎙️ STT & GPT 결과
  const [sttResult, setSttResult] = useState('');
  const [gptResult, setGptResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 해시태그 입력 상태
  const [newHashtag, setNewHashtag] = useState('');

  //--------------------------------------------------
  // 1) 운동 목록, 이전 기록, 최근 운동 불러오기
  //--------------------------------------------------
  useEffect(() => {
    axios
      .get('http://localhost:8080/api/diaries/workout')
      .then((res) => {
        setAllWorkoutList(res.data);
        setWorkoutList(res.data);
      })
      .catch((err) => console.error('🚨 운동 목록 불러오기 실패:', err));

    // 이전 기록 (최대 5개)
    axios
      .get('http://localhost:8080/api/diaries/workout/previous?limit=5')
      .then((res) => setPreviousRecords(res.data))
      .catch((err) => console.error('🚨 이전 기록 불러오기 실패:', err));

    // 최근 운동 (최대 20개)
    axios
      .get('http://localhost:8080/api/diaries/workout/recent?limit=20')
      .then((res) => setRecentExercises(res.data))
      .catch((err) => console.error('🚨 최근 운동 불러오기 실패:', err));
  }, []);

  //--------------------------------------------------
  // 2) 검색 API 호출 (전체 목록에서 검색해서 workoutList만 업데이트)
  //--------------------------------------------------
  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    if (keyword.trim() === '') {
      setWorkoutList(allWorkoutList);
    } else {
      const filtered = allWorkoutList.filter((workout) =>
        workout.workoutName.toLowerCase().includes(keyword.toLowerCase())
      );
      setWorkoutList(filtered);
    }
  };

  //--------------------------------------------------
  // 3) 모달 열기 / 닫기
  //--------------------------------------------------
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // 모달 내에서 운동 선택(체크박스 클릭 시) 처리
  const toggleSelectedWorkout = (workoutId) => {
    setSelectedWorkouts((prevSelected) => {
      if (prevSelected.includes(workoutId)) {
        return prevSelected.filter((id) => id !== workoutId);
      } else {
        return [...prevSelected, workoutId];
      }
    });
  };

  //--------------------------------------------------
  // 4) 선택된 운동들을 일지에 추가 (다중 선택)
  //--------------------------------------------------
  const handleWorkoutSelection = () => {
    if (selectedWorkouts.length === 0) {
      alert('운동을 하나 이상 선택해주세요!');
      return;
    }
    setDiary((prevDiary) => {
      const updatedDiaryWorkouts = [...prevDiary.diaryWorkouts];
      selectedWorkouts.forEach((workoutId) => {
        const existingIndex = updatedDiaryWorkouts.findIndex(
          (dw) => dw.workoutId === workoutId
        );
        if (existingIndex !== -1) {
          updatedDiaryWorkouts[existingIndex].sets.push({
            weight: 10,
            repetition: 10,
            workoutTime: 10,
          });
        } else {
          updatedDiaryWorkouts.push({
            workoutId,
            sets: [{ weight: 10, repetition: 10, workoutTime: 10 }],
          });
        }
      });
      return { ...prevDiary, diaryWorkouts: updatedDiaryWorkouts };
    });
    setSelectedWorkouts([]);
    closeModal();
  };

  // 추가: 이전 기록/최근 운동 항목 클릭 시 default 세트 포함하여 추가
  const handleAddRecord = (record) => {
    // record.workoutId가 백엔드 응답 DTO에 포함되어 있어야 함
    if (!record.workoutId) {
      alert('운동 정보를 불러오지 못했습니다.');
      return;
    }
    setDiary((prevDiary) => ({
      ...prevDiary,
      diaryWorkouts: [
        ...prevDiary.diaryWorkouts,
        {
          workoutId: record.workoutId,
          sets: [{ weight: 10, repetition: 10, workoutTime: 10 }],
        },
      ],
    }));
    alert(`${record.workoutName} 운동이 추가되었습니다.`);
    closeModal();
  };

  //--------------------------------------------------
  // 5) 운동 세트 추가 (같은 운동에 새로운 세트 추가)
  //--------------------------------------------------
  const handleAddSet = (workoutIndex) => {
    setDiary((prevDiary) => {
      const newDiaryWorkouts = [...prevDiary.diaryWorkouts];
      newDiaryWorkouts[workoutIndex] = {
        ...newDiaryWorkouts[workoutIndex],
        sets: [
          ...newDiaryWorkouts[workoutIndex].sets,
          { weight: 10, repetition: 10, workoutTime: 10 },
        ],
      };
      return { ...prevDiary, diaryWorkouts: newDiaryWorkouts };
    });
  };

  //--------------------------------------------------
  // 6) 특정 세트 삭제 (세트별 삭제)
  //--------------------------------------------------
  const handleDeleteSet = (workoutIndex, setIndex) => {
    setDiary((prevDiary) => {
      const newDiaryWorkouts = [...prevDiary.diaryWorkouts];
      newDiaryWorkouts[workoutIndex] = {
        ...newDiaryWorkouts[workoutIndex],
        sets: newDiaryWorkouts[workoutIndex].sets.filter(
          (_, idx) => idx !== setIndex
        ),
      };
      return { ...prevDiary, diaryWorkouts: newDiaryWorkouts };
    });
  };

  //--------------------------------------------------
  // 7) 음성 녹음 버튼 (시작/종료)
  //--------------------------------------------------
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
            setDiary((prevDiary) => ({
              ...prevDiary,
              diaryWorkouts: [
                ...prevDiary.diaryWorkouts,
                ...(response.data.diaryWorkouts || []),
              ],
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

  //--------------------------------------------------
  // 8) 운동 전체 삭제 (운동 삭제 버튼)
  //--------------------------------------------------
  const handleDeleteWorkout = (indexOfWorkout) => {
    setDiary((prevDiary) => ({
      ...prevDiary,
      diaryWorkouts: prevDiary.diaryWorkouts.filter((_, idx) => idx !== indexOfWorkout),
    }));
  };

  //--------------------------------------------------
  // 9) 운동 세트 정보 수정 (무게, 횟수, 시간)
  //--------------------------------------------------
  const handleWorkoutSetChange = (workoutIndex, setIndex, field, value) => {
    setDiary((prevDiary) => {
      const newDiaryWorkouts = [...prevDiary.diaryWorkouts];
      newDiaryWorkouts[workoutIndex] = {
        ...newDiaryWorkouts[workoutIndex],
        sets: newDiaryWorkouts[workoutIndex].sets.map((set, idx) => {
          if (idx === setIndex) {
            return { ...set, [field]: Number(value) };
          }
          return set;
        }),
      };
      return { ...prevDiary, diaryWorkouts: newDiaryWorkouts };
    });
  };

  //--------------------------------------------------
  // 10) 이미지 업로드
  //--------------------------------------------------
  const handleImageChange = (e) => {
    setFile(e.target.files[0]);
    const preview = URL.createObjectURL(e.target.files[0]);
    setPreviewUrl(preview);
  };

  // 11) 운동일지 저장
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
    console.log(JSON.stringify(diary, null, 2));

  };

  //--------------------------------------------------
  // 12) 해시태그 추가
  //--------------------------------------------------
  const handleAddHashtag = () => {
    if (newHashtag.trim() && !diary.hashtags.includes(newHashtag)) {
      setDiary((prevDiary) => ({
        ...prevDiary,
        hashtags: [...prevDiary.hashtags, newHashtag.trim()],
      }));
      setNewHashtag('');
    }
  };

  // 모달에서 필터링된 운동 목록 (검색된 workoutList 적용)
  const filteredWorkoutList = workoutList.filter((workout) => {
    return (
      (selectedPartFilter === '' || workout.part === selectedPartFilter) &&
      (selectedToolFilter === '' || workout.tool === selectedToolFilter)
    );
  });

  // 필터 버튼용: 고유 부위 및 기구
  const uniqueParts = [...new Set(allWorkoutList.map((w) => w.part))];
  const uniqueTools = [...new Set(allWorkoutList.map((w) => w.tool))];

  // Helper: workoutId에 해당하는 운동 이름 반환
  const getWorkoutName = (workoutId) => {
    const workoutObj = allWorkoutList.find((w) => w.workoutId === workoutId);
    return workoutObj ? workoutObj.workoutName : workoutId;
  };

  return (
    <>
      <TopBar />
      <div className="m-5 pb-24">
        {/* 날짜 */}
        <div>
          <label htmlFor="date">날짜 </label>
          <input
            type="date"
            id="date"
            value={diary.workoutDate}
            onChange={(e) => setDiary({ ...diary, workoutDate: e.target.value })}
          />
        </div>

        {/* 운동 추가 & 음성 운동 추가 버튼 */}
        <div className="flex items-center space-x-4 mt-4">
          <button onClick={openModal} className="w-1/2 p-2 bg-gray-500 text-white rounded">
            🏋️‍♂️ 운동 추가
          </button>
          <button onClick={handleRecordButton} className="w-1/2 p-2 bg-blue-500 text-white rounded">
            {isRecording ? '⏹ 녹음 중... (클릭 시 종료)' : '🎤 음성 운동 추가'}
          </button>
        </div>

        {/* 운동 선택 모달 */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-2xl w-full">
              <h2 className="text-xl font-bold mb-4">운동 추가하기</h2>

              {/* 필터: 부위 */}
              <div className="mb-2">
                <span className="mr-2 font-semibold">부위: </span>
                <button
                  onClick={() => setSelectedPartFilter('')}
                  className={`mr-2 px-2 py-1 border rounded ${selectedPartFilter === '' ? 'bg-blue-500 text-white' : ''}`}
                >
                  전체
                </button>
                {uniqueParts.map((part) => (
                  <button
                    key={part}
                    onClick={() => setSelectedPartFilter(part)}
                    className={`mr-2 px-2 py-1 border rounded ${selectedPartFilter === part ? 'bg-blue-500 text-white' : ''}`}
                  >
                    {part}
                  </button>
                ))}
              </div>

              {/* 필터: 기구 */}
              <div className="mb-2">
                <span className="mr-2 font-semibold">기구: </span>
                <button
                  onClick={() => setSelectedToolFilter('')}
                  className={`mr-2 px-2 py-1 border rounded ${selectedToolFilter === '' ? 'bg-blue-500 text-white' : ''}`}
                >
                  전체
                </button>
                {uniqueTools.map((tool) => (
                  <button
                    key={tool}
                    onClick={() => setSelectedToolFilter(tool)}
                    className={`mr-2 px-2 py-1 border rounded ${selectedToolFilter === tool ? 'bg-blue-500 text-white' : ''}`}
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

              {/* 이전 기록 */}
              <div className="mt-4">
                <h3 className="text-lg font-bold">이전 기록</h3>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {previousRecords.map((record) => (
                    <div
                      key={record.diaryWorkoutId}
                      className="p-2 border-b cursor-pointer"
                      onClick={() => handleAddRecord(record)}
                    >
                      <p className="text-sm">
                        {record.workoutDate} - {record.workoutName} ({record.part})
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 최근 운동 */}
              <div className="mt-4">
                <h3 className="text-lg font-bold">최근 운동</h3>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {recentExercises.map((exercise) => (
                    <div
                      key={exercise.diaryWorkoutId}
                      className="p-2 border-b cursor-pointer"
                      onClick={() => handleAddRecord(exercise)}
                    >
                      <p className="text-sm">{exercise.workoutName}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 운동 리스트 (필터링 적용) */}
              <div className="space-y-2 max-h-60 overflow-y-auto mt-4">
                {filteredWorkoutList.map((workout) => (
                  <div
                    key={workout.workoutId}
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
                <button onClick={closeModal} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                  취소
                </button>
                <button onClick={handleWorkoutSelection} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  추가 완료
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading && <p>🔄 변환 중...</p>}

        {/* 추가된 운동 목록 */}
        <div className="mt-4">
          {diary.diaryWorkouts.map((workout, index) => (
            <div key={index} className="border p-2 rounded mb-2">
              <div className="flex justify-between items-center">
                <h2>{getWorkoutName(workout.workoutId)}</h2>
                <div className="flex space-x-2">
                  <button onClick={() => handleAddSet(index)} className="px-2 py-1 bg-green-500 text-white rounded">
                    +
                  </button>
                  <button onClick={() => handleDeleteWorkout(index)} className="px-2 py-1 bg-red-500 text-white rounded">
                    🗑️
                  </button>
                </div>
              </div>
              {workout.sets.map((set, setIndex) => (
                <div key={setIndex} className="flex items-center space-x-4 mt-2">
                  <div>
                    <label className="mr-1">무게:</label>
                    <input
                      type="number"
                      value={set.weight}
                      onChange={(e) => handleWorkoutSetChange(index, setIndex, 'weight', e.target.value)}
                      className="w-20 p-1 border rounded"
                    />
                  </div>
                  <div>
                    <label className="mr-1">횟수:</label>
                    <input
                      type="number"
                      value={set.repetition}
                      onChange={(e) => handleWorkoutSetChange(index, setIndex, 'repetition', e.target.value)}
                      className="w-20 p-1 border rounded"
                    />
                  </div>
                  <div>
                    <label className="mr-1">시간:</label>
                    <input
                      type="number"
                      value={set.workoutTime}
                      onChange={(e) => handleWorkoutSetChange(index, setIndex, 'workoutTime', e.target.value)}
                      className="w-20 p-1 border rounded"
                    />
                  </div>
                  <button onClick={() => handleDeleteSet(index, setIndex)} className="px-2 py-1 bg-red-300 text-white rounded">
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
            onChange={handleImageChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          <img
            src={previewUrl}
            alt="이미지 미리보기"
            className="w-40 h-40 object-cover rounded-md shadow-md cursor-pointer"
            onClick={() => fileInputRef.current.click()}
          />
        </div>

        {/* 운동일지 내용 */}
        <textarea
          className="w-full h-24 mt-4 p-2 border rounded"
          value={diary.content}
          onChange={(e) => setDiary({ ...diary, content: e.target.value })}
          placeholder="운동일지 내용을 입력하세요."
        />

        {/* 해시태그 추가 */}
        <div className="mt-4">
          <input
            type="text"
            className="p-2 border rounded"
            value={newHashtag}
            onChange={(e) => setNewHashtag(e.target.value)}
            placeholder="해시태그 입력"
          />
          <button onClick={handleAddHashtag} className="p-2 bg-blue-500 text-white rounded ml-2">
            추가
          </button>
        </div>
        <div className="mt-2">
          {diary.hashtags.map((tag, index) => (
            <span key={index} className="p-1 bg-gray-200 rounded-full text-sm mr-2">
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
