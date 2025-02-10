import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import BottomBar from '../../components/bar/BottomBar';
import TopBar from '../../components/bar/TopBar';

export default function WorkoutUpdatePage() {
  const navigate = useNavigate();
  const { diaryId } = useParams();

  // ---------------------------
  // 0) 일지 상태 (수정용)
  // ---------------------------
  const [diary, setDiary] = useState({
    diaryId: null,
    workoutDate: '',
    content: '',
    allowedScope: 'A',
    hashtags: [],
    // diaryWorkouts: [{ workoutId, sets: [...], deleted?: boolean }, ...]
    diaryWorkouts: [],
  });

  // 기존 이미지 목록
  const [existingImages, setExistingImages] = useState([]);

  // ---------------------------
  // 1) 운동 목록 / 이전 기록 / 최근 운동
  // ---------------------------
  const [allWorkoutList, setAllWorkoutList] = useState([]);
  const [workoutList, setWorkoutList] = useState([]);
  const [previousRecords, setPreviousRecords] = useState([]);
  const [recentExercises, setRecentExercises] = useState([]);

  // ---------------------------
  // 2) 모달 제어
  // ---------------------------
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [isPreviousModalOpen, setIsPreviousModalOpen] = useState(false);

  // 최근 운동 토글
  const [showRecentExercises, setShowRecentExercises] = useState(false);

  // 모달에서 선택된 workoutId 배열
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 필터 (부위, 기구)
  const [selectedPartFilter, setSelectedPartFilter] = useState('');
  const [selectedToolFilter, setSelectedToolFilter] = useState('');

  // ---------------------------
  // 3) 새로 업로드할 이미지
  // ---------------------------
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);

  // ---------------------------
  // 4) 음성 녹음 관련(STT)
  // ---------------------------
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunksRef = useRef([]);
  const [recordStartTime, setRecordStartTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // ---------------------------
  // 5) 해시태그 입력
  // ---------------------------
  const [newHashtag, setNewHashtag] = useState('');

  // ---------------------------
  // 마운트 시점: 일지 상세 + 운동 목록/이전 기록/최근 운동 조회
  // ---------------------------
  useEffect(() => {
    if (!diaryId) {
      alert('수정할 일지 ID가 없습니다.');
      navigate('/workout');
      return;
    }
    fetchDiaryDetail(diaryId);
    fetchBaseData();
  }, [diaryId]);

  // (A) 기존 일지 상세 조회
  const fetchDiaryDetail = async (id) => {
    try {
      const res = await axiosInstance.get(`/diaries/${id}`, { withCredentials: true });
      const data = res.data;
      setDiary({
        diaryId: data.diaryId,
        workoutDate: data.workoutDate,
        content: data.content,
        allowedScope: data.allowedScope,
        hashtags: data.hashtags || [],
        diaryWorkouts: (data.diaryWorkouts || []).map((dw) => ({
          workoutId: dw.workoutId,
          deleted: false,
          sets: (dw.sets || []).map((s) => ({
            weight: s.weight,
            repetition: s.repetition,
            workoutTime: s.workoutTime,
            deleted: false,
          })),
        })),
      });

      if (data.images && data.images.length > 0) {
        setExistingImages(data.images);
      }
    } catch (err) {
      console.error('❌ 일지 불러오기 실패:', err);
      alert('일지를 불러오지 못했습니다.');
      navigate('/workout');
    }
  };

  // (B) 운동 목록/이전 기록/최근 운동 조회
  const fetchBaseData = async () => {
    try {
      const workoutRes = await axiosInstance.get('/diaries/workout', { withCredentials: true });
      setAllWorkoutList(workoutRes.data);
      setWorkoutList(workoutRes.data);

      const prevRes = await axiosInstance.get('/diaries/workout/previous?limit=5', {
        withCredentials: true,
      });
      setPreviousRecords(prevRes.data);

      const recentRes = await axiosInstance.get('/diaries/workout/recent?limit=20', {
        withCredentials: true,
      });
      setRecentExercises(recentRes.data);
    } catch (err) {
      console.error('❌ 운동목록/이전기록/최근운동 조회 실패:', err);
    }
  };

  // ---------------------------
  // 운동 목록 필터링 + 검색
  // ---------------------------
  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    if (keyword.trim() === '') {
      setWorkoutList(allWorkoutList);
    } else {
      const filtered = allWorkoutList.filter((w) =>
        w.workoutName.toLowerCase().includes(keyword.toLowerCase())
      );
      setWorkoutList(filtered);
    }
  };

  const filteredWorkoutList = workoutList.filter((workout) => {
    const alreadyInDiary = diary.diaryWorkouts.some(
      (dw) => dw.workoutId === workout.workoutId && dw.deleted !== true
    );
    if (alreadyInDiary) return false;
    if (selectedPartFilter && workout.part !== selectedPartFilter) return false;
    if (selectedToolFilter && workout.tool !== selectedToolFilter) return false;
    return true;
  });

  // ---------------------------
  // 모달 열기/닫기
  // ---------------------------
  const openExerciseModal = () => setIsExerciseModalOpen(true);
  const closeExerciseModal = () => setIsExerciseModalOpen(false);
  const openPreviousModal = () => setIsPreviousModalOpen(true);
  const closePreviousModal = () => setIsPreviousModalOpen(false);
  const toggleRecentExercisesVisibility = () => setShowRecentExercises((prev) => !prev);

  // ---------------------------
  // (운동 모달) 운동 선택/해제
  // ---------------------------
  const toggleSelectedWorkout = (workoutId) => {
    setSelectedWorkouts((prev) =>
      prev.includes(workoutId) ? prev.filter((id) => id !== workoutId) : [...prev, workoutId]
    );
  };

  const handleWorkoutSelection = () => {
    if (selectedWorkouts.length === 0) {
      alert('운동을 하나 이상 선택해주세요!');
      return;
    }
    // 선택된 운동들을 diaryWorkouts에 추가 (기본 세트 한 개씩)
    setDiary((prevDiary) => {
      const newDiaryWorkouts = [...prevDiary.diaryWorkouts];
      selectedWorkouts.forEach((wid) => {
        newDiaryWorkouts.push({
          workoutId: wid,
          deleted: false,
          sets: [{ weight: 10, repetition: 10, workoutTime: 10, deleted: false }],
        });
      });
      return { ...prevDiary, diaryWorkouts: newDiaryWorkouts };
    });
    setSelectedWorkouts([]);
    closeExerciseModal();
  };

  // ---------------------------
  // 이전 기록 / 최근 운동에서 추가
  // ---------------------------
  const handleAddRecord = (record) => {
    setDiary((prevDiary) => {
      const newDiaryWorkouts = [...prevDiary.diaryWorkouts];
      record.workoutIds.forEach((wid) => {
        const exists = newDiaryWorkouts.some((dw) => dw.workoutId === wid && dw.deleted === false);
        if (!exists) {
          const setsForThisWorkout = record.sets
            .filter((s) => s.workoutId === wid)
            .map((s) => ({
              weight: s.weight || 10,
              repetition: s.repetition || 10,
              workoutTime: s.workoutTime || 10,
              deleted: false,
            }));
          const finalSets =
            setsForThisWorkout.length > 0
              ? setsForThisWorkout
              : [{ weight: 10, repetition: 10, workoutTime: 10, deleted: false }];
          newDiaryWorkouts.push({
            workoutId: wid,
            deleted: false,
            sets: finalSets,
          });
        }
      });
      return { ...prevDiary, diaryWorkouts: newDiaryWorkouts };
    });
    alert(`"${record.workoutName}" 운동들이 추가되었습니다.`);
    closePreviousModal();
  };

  // ---------------------------
  // 음성 녹음(STT)
  // ---------------------------
  const handleRecordButton = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { sampleRate: 48000, channelCount: 1, noiseSuppression: true, echoCancellation: true },
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
            alert('녹음이 너무 짧습니다. 다시 시도해주세요.');
            return;
          }
          setIsLoading(true);
          try {
            const formData = new FormData();
            formData.append('audioFile', audioBlob);
            const response = await axiosInstance.post('/ai-diary/auto', formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
              withCredentials: true,
            });
            console.log('📦 STT 응답 데이터:', response.data);
            if (response.data.invalidInput) {
              alert('운동을 인식하지 못했습니다. 다시 말씀해주세요.');
              return;
            }
            if (response.data.diaryWorkouts) {
              setDiary((prevDiary) => {
                const newDiaryWorkouts = [...prevDiary.diaryWorkouts];
                for (const dw of response.data.diaryWorkouts) {
                  if (!newDiaryWorkouts.some((x) => x.workoutId === dw.workoutId && !x.deleted)) {
                    newDiaryWorkouts.push({
                      workoutId: dw.workoutId,
                      deleted: false,
                      sets: (dw.sets || []).map((s) => ({
                        weight: s.weight,
                        repetition: s.repetition,
                        workoutTime: s.workoutTime,
                        deleted: false,
                      })),
                    });
                  }
                }
                return { ...prevDiary, diaryWorkouts: newDiaryWorkouts };
              });
            }
          } catch (err) {
            alert('🚨 오류 발생! 운동을 인식할 수 없습니다.');
            console.error('음성 처리 실패:', err);
          }
          setIsLoading(false);
        };
        recorder.start();
        setIsRecording(true);
      } catch (error) {
        alert('🚨 마이크 접근 오류! 마이크 사용 권한을 확인해주세요.');
        console.error('마이크 접근 오류:', error);
      }
    } else {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // ---------------------------
  // 운동 삭제 / 세트 추가/삭제 / 세트 수정 (핸들러들: workoutId 사용)
  // ---------------------------
  const handleAddSet = (workoutId) => {
    setDiary((prev) => {
      const newDiaryWorkouts = prev.diaryWorkouts.map((dw) => {
        if (!dw.deleted && dw.workoutId === workoutId) {
          return { ...dw, sets: [...dw.sets, { weight: 10, repetition: 10, workoutTime: 10, deleted: false }] };
        }
        return dw;
      });
      return { ...prev, diaryWorkouts: newDiaryWorkouts };
    });
  };

  const handleDeleteWorkout = (workoutId) => {
    setDiary((prev) => {
      const newDiaryWorkouts = prev.diaryWorkouts.map((dw) => {
        if (!dw.deleted && dw.workoutId === workoutId) {
          return { ...dw, deleted: true, sets: dw.sets.map((s) => ({ ...s, deleted: true })) };
        }
        return dw;
      });
      return { ...prev, diaryWorkouts: newDiaryWorkouts };
    });
  };

  const handleDeleteSet = (workoutId, setIndex) => {
    setDiary((prev) => {
      const newDiaryWorkouts = prev.diaryWorkouts.map((dw) => {
        if (!dw.deleted && dw.workoutId === workoutId) {
          const newSets = dw.sets.map((s, idx) => (idx === setIndex ? { ...s, deleted: true } : s));
          return { ...dw, sets: newSets };
        }
        return dw;
      });
      return { ...prev, diaryWorkouts: newDiaryWorkouts };
    });
  };

  const handleWorkoutSetChange = (workoutId, setIndex, field, value) => {
    setDiary((prev) => {
      const newDiaryWorkouts = prev.diaryWorkouts.map((dw) => {
        if (!dw.deleted && dw.workoutId === workoutId) {
          const newSets = dw.sets.map((s, idx) => (idx === setIndex ? { ...s, [field]: Number(value) } : s));
          return { ...dw, sets: newSets };
        }
        return dw;
      });
      return { ...prev, diaryWorkouts: newDiaryWorkouts };
    });
  };

  // ---------------------------
  // 기존 이미지 제거
  // ---------------------------
  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ---------------------------
  // 새 이미지 업로드
  // ---------------------------
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const maxSize = 1 * 1024 * 1024; // 1MB 제한
    for (let file of selectedFiles) {
      if (file.size > maxSize) {
        alert(`파일이 너무 큽니다: ${file.name}`);
        return;
      }
    }
    if (existingImages.length + files.length + selectedFiles.length > 6) {
      alert('이미지는 최대 6장까지 업로드할 수 있습니다.');
      return;
    }
    setFiles((prev) => [...prev, ...selectedFiles]);
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // ---------------------------
  // PATCH (수정) 요청
  // ---------------------------
  const handleDiaryUpdate = async () => {
    if (!diary.diaryId) {
      alert('수정할 일지 ID가 없습니다!');
      return;
    }
    const formData = new FormData();
    const diaryBlob = new Blob([JSON.stringify(diary)], { type: 'application/json' });
    formData.append('diary', diaryBlob);
    const urlsBlob = new Blob([JSON.stringify(existingImages.map((img) => img.url))], {
      type: 'application/json',
    });
    formData.append('urls', urlsBlob);
    files.forEach((f) => formData.append('files', f));
    try {
      await axiosInstance.patch(`/diaries/${diary.diaryId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      alert('✅ 수정 완료!');
      navigate('/workout');
    } catch (err) {
      console.error('❌ 수정 오류:', err);
      alert('🚨 수정 실패!');
    }
  };

  // ---------------------------
  // 해시태그 추가
  // ---------------------------
  const handleAddHashtag = () => {
    const tag = newHashtag.trim();
    if (tag && !diary.hashtags.includes(tag)) {
      setDiary((prev) => ({ ...prev, hashtags: [...prev.hashtags, tag] }));
      setNewHashtag('');
    }
  };

  // ---------------------------
  // Helper: workoutId -> 운동 이름
  // ---------------------------
  const getWorkoutName = (workoutId) => {
    const found = allWorkoutList.find((w) => w.workoutId === workoutId);
    return found ? found.workoutName : `운동ID: ${workoutId}`;
  };

  // ---------------------------
  // 렌더링
  // ---------------------------
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

        {/* 상단 버튼들 */}
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
            <div className="bg-white p-6 rounded shadow-lg max-w-2xl w-full">
              <h2 className="text-xl font-bold mb-4">운동 추가하기</h2>
              {/* 부위 필터 */}
              <div className="mb-2">
                <span className="mr-2 font-semibold">부위: </span>
                <button
                  onClick={() => setSelectedPartFilter('')}
                  className={`mr-2 px-2 py-1 border rounded ${selectedPartFilter === '' ? 'bg-blue-500 text-white' : ''}`}
                >
                  전체
                </button>
                {[...new Set(allWorkoutList.map((w) => w.part))].map((part) => (
                  <button
                    key={`part-${part}`}
                    onClick={() => setSelectedPartFilter(part)}
                    className={`mr-2 px-2 py-1 border rounded ${selectedPartFilter === part ? 'bg-blue-500 text-white' : ''}`}
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
                  className={`mr-2 px-2 py-1 border rounded ${selectedToolFilter === '' ? 'bg-blue-500 text-white' : ''}`}
                >
                  전체
                </button>
                {[...new Set(allWorkoutList.map((w) => w.tool))].map((tool) => (
                  <button
                    key={`tool-${tool}`}
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
                placeholder="운동 검색"
                className="w-full p-2 border rounded mb-4"
                value={searchKeyword}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {/* 최근 운동 토글 */}
              <div className="mb-4">
                <button onClick={toggleRecentExercisesVisibility} className="px-4 py-2 bg-purple-500 text-white rounded">
                  {showRecentExercises ? '최근 운동 숨기기' : '최근 운동 보기'}
                </button>
              </div>
              {showRecentExercises && (
                <div className="space-y-1 max-h-48 overflow-y-auto mb-4 border-t pt-2">
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
              {/* 필터 후 목록 */}
              <div className="space-y-2 max-h-60 overflow-y-auto border-t pt-2">
                {filteredWorkoutList.map((workout) => (
                  <div
                    key={`w-${workout.workoutId}`}
                    className="flex justify-between items-center p-2 border rounded hover:bg-gray-100 cursor-pointer"
                    onClick={() => toggleSelectedWorkout(workout.workoutId)}
                  >
                    <div>
                      <p className="font-bold">{workout.workoutName}</p>
                      <p className="text-sm text-gray-600">{workout.part} / {workout.tool}</p>
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
            <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">이전 기록</h2>
              <div className="space-y-1 max-h-64 overflow-y-auto border-t pt-2">
                {previousRecords.map((record, idx) => (
                  <div
                    key={`prev-${record.diaryWorkoutId || idx}`}
                    className="p-2 border-b cursor-pointer"
                    onClick={() => handleAddRecord(record)}
                  >
                    <p className="text-sm">
                      {record.workoutDate} - {record.workoutName}
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

        {/* 이미 추가된 운동 목록 (workoutId를 key로 사용) */}
        <div className="mt-4">
          {diary.diaryWorkouts
            .filter((dw) => !dw.deleted)
            .map((workout) => (
              <div key={workout.workoutId} className="border p-2 rounded mb-2">
                <div className="flex justify-between items-center">
                  <h2>{getWorkoutName(workout.workoutId)}</h2>
                  <div className="flex space-x-2">
                    <button onClick={() => handleAddSet(workout.workoutId)} className="px-2 py-1 bg-green-500 text-white rounded">
                      +세트
                    </button>
                    <button onClick={() => handleDeleteWorkout(workout.workoutId)} className="px-2 py-1 bg-red-500 text-white rounded">
                      🗑️운동
                    </button>
                  </div>
                </div>
                {workout.sets
                  .filter((s) => !s.deleted)
                  .map((set, setIndex) => (
                    <div key={setIndex} className="flex items-center space-x-4 mt-2">
                      <div>
                        <label className="mr-1">무게:</label>
                        <input
                          type="number"
                          value={set.weight}
                          onChange={(e) => handleWorkoutSetChange(workout.workoutId, setIndex, 'weight', e.target.value)}
                          className="w-20 p-1 border rounded"
                        />
                      </div>
                      <div>
                        <label className="mr-1">횟수:</label>
                        <input
                          type="number"
                          value={set.repetition}
                          onChange={(e) => handleWorkoutSetChange(workout.workoutId, setIndex, 'repetition', e.target.value)}
                          className="w-20 p-1 border rounded"
                        />
                      </div>
                      <div>
                        <label className="mr-1">시간:</label>
                        <input
                          type="number"
                          value={set.workoutTime}
                          onChange={(e) => handleWorkoutSetChange(workout.workoutId, setIndex, 'workoutTime', e.target.value)}
                          className="w-20 p-1 border rounded"
                        />
                      </div>
                      <button onClick={() => handleDeleteSet(workout.workoutId, setIndex)} className="px-2 py-1 bg-red-300 text-white rounded">
                        🗑️세트
                      </button>
                    </div>
                  ))}
              </div>
            ))}
        </div>

        {/* 기존 이미지 목록 */}
        {existingImages.length > 0 && (
          <div className="mt-6">
            <label className="font-bold mb-2">기존 이미지</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {existingImages.map((img, idx) => (
                <div key={img.imageId} className="relative w-40 h-40">
                  <img src={img.url} alt="existing" className="w-full h-full object-cover rounded-md shadow-md" />
                  <button onClick={() => handleRemoveExistingImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white text-sm px-1 rounded">
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 새 이미지 업로드 */}
        <div className="mt-4">
          <input type="file" accept="image/*" multiple onChange={handleImageChange} ref={fileInputRef} style={{ display: 'none' }} />
          <div className="flex flex-col">
            <label className="font-bold mb-2">새 이미지 첨부 (최대 6장)</label>
            <div className="flex flex-wrap gap-2">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="relative w-40 h-40">
                  <img src={url} alt="preview" className="w-full h-full object-cover rounded-md shadow-md" />
                  <button onClick={() => handleRemoveImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white text-sm px-1 rounded">
                    X
                  </button>
                </div>
              ))}
              {(() => {
                const placeholdersCount = Math.max(0, 6 - existingImages.length - previewUrls.length);
                return Array.from({ length: placeholdersCount }).map((_, i) => (
                  <div
                    key={`placeholder-${i}`}
                    className="w-40 h-40 bg-gray-200 rounded-md flex items-center justify-center cursor-pointer"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <span className="text-gray-500">이미지 없음</span>
                  </div>
                ));
              })()}
            </div>
            <button className="mt-2 p-2 bg-blue-500 text-white rounded w-40" onClick={() => fileInputRef.current.click()}>
              이미지 선택
            </button>
          </div>
        </div>

        {/* 운동일지 내용 */}
        <textarea
          className="w-full h-24 mt-4 p-2 border rounded"
          value={diary.content}
          onChange={(e) => setDiary({ ...diary, content: e.target.value })}
          placeholder="운동일지 내용을 입력하세요."
        />

        {/* 해시태그 입력 */}
        <div className="mt-4">
          <input type="text" className="p-2 border rounded" value={newHashtag} onChange={(e) => setNewHashtag(e.target.value)} placeholder="해시태그 입력" />
          <button onClick={handleAddHashtag} className="p-2 bg-blue-500 text-white rounded ml-2">
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
          <select value={diary.allowedScope} onChange={(e) => setDiary({ ...diary, allowedScope: e.target.value })}>
            <option value="A">모두 공개</option>
            <option value="M">비공개</option>
          </select>
        </div>

        {/* 수정 버튼 */}
        <button onClick={handleDiaryUpdate} className="mt-4 p-2 bg-gray-500 text-white rounded">
          수정
        </button>
      </div>
      <BottomBar />
    </>
  );
}
