import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance'; // ✅ axiosInstance 사용
import BottomBar from '../../components/bar/BottomBar';
import TopBar from '../../components/bar/TopBar';

export default function WorkoutUpdatePage() {
  const navigate = useNavigate();
  const { diaryId } = useParams();

  // -------------------------------------
  // 1) 수정할 일지 상태
  // -------------------------------------
  const [diary, setDiary] = useState({
    diaryId: null,
    workoutDate: '',
    content: '',
    allowedScope: 'A',
    hashtags: [],
    diaryWorkouts: [],
  });

  // 기존 이미지 목록
  const [existingImages, setExistingImages] = useState([]);

  // -------------------------------------
  // 2) 운동 목록 / 이전 기록 / 최근 운동
  // -------------------------------------
  const [allWorkoutList, setAllWorkoutList] = useState([]);
  const [workoutList, setWorkoutList] = useState([]);
  const [previousRecords, setPreviousRecords] = useState([]);
  const [recentExercises, setRecentExercises] = useState([]);

  // 모달 제어
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [isPreviousModalOpen, setIsPreviousModalOpen] = useState(false);

  // 최근 운동 토글
  const [showRecentExercises, setShowRecentExercises] = useState(false);

  // 운동 모달에서 선택된 운동들
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 필터
  const [selectedPartFilter, setSelectedPartFilter] = useState('');
  const [selectedToolFilter, setSelectedToolFilter] = useState('');

  // -------------------------------------
  // 3) 새로 업로드할 이미지
  // -------------------------------------
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);

  // -------------------------------------
  // 4) 음성 녹음 관련 (선택사항)
  // -------------------------------------
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunksRef = useRef([]);
  const [recordStartTime, setRecordStartTime] = useState(0);

  // -------------------------------------
  // 5) 해시태그 입력
  // -------------------------------------
  const [newHashtag, setNewHashtag] = useState('');

  // -------------------------------------
  // 마운트 시점: diary 상세 + 운동 목록/이전 기록/최근 운동 불러오기
  // -------------------------------------
  useEffect(() => {
    if (!diaryId) {
      alert('수정할 일지 ID가 없습니다.');
      navigate('/workout');
      return;
    }
    fetchDiaryDetail(diaryId);
    fetchBaseData();
  }, [diaryId]);

  // (A) 기존 일지 상세조회
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
          diaryWorkoutId: dw.diaryWorkoutId,
          workoutId: dw.workoutId,
          deleted: false,
          sets: (dw.sets || []).map((s) => ({
            workoutSetId: s.workoutSetId,
            weight: s.weight,
            repetition: s.repetition,
            workoutTime: s.workoutTime,
            deleted: false,
          })),
        })),
      });

      // 기존 이미지 목록
      if (data.images && data.images.length > 0) {
        setExistingImages(data.images); // [{imageId, url}, ...]
      }
    } catch (err) {
      console.error('❌ 일지 불러오기 실패:', err);
      alert('일지를 불러오지 못했습니다.');
      navigate('/workout');
    }
  };

  // (B) 운동 목록 + 이전 기록 + 최근 운동
  const fetchBaseData = async () => {
    try {
      // 운동 목록
      const workoutRes = await axiosInstance.get('/diaries/workout', { withCredentials: true });
      setAllWorkoutList(workoutRes.data);
      setWorkoutList(workoutRes.data);

      // 이전 기록
      const prevRes = await axiosInstance.get('/diaries/workout/previous?limit=5', {
        withCredentials: true,
      });
      setPreviousRecords(prevRes.data);

      // 최근 운동
      const recentRes = await axiosInstance.get('/diaries/workout/recent?limit=20', {
        withCredentials: true,
      });
      setRecentExercises(recentRes.data);
    } catch (err) {
      console.error('❌ 운동 목록/이전 기록/최근 운동 실패:', err);
    }
  };

  // -------------------------------------
  // 운동 목록 필터링 + 검색
  // -------------------------------------
  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    if (!keyword.trim()) {
      setWorkoutList(allWorkoutList);
    } else {
      const filtered = allWorkoutList.filter((w) =>
        w.workoutName.toLowerCase().includes(keyword.toLowerCase())
      );
      setWorkoutList(filtered);
    }
  };

  // 필터를 적용한 최종 운동 목록
  const filteredWorkoutList = workoutList.filter((workout) => {
    // 이미 추가된 + 삭제되지 않은 운동은 리스트에서 제외
    const alreadyAdded = diary.diaryWorkouts.some(
      (dw) => dw.workoutId === workout.workoutId && !dw.deleted
    );
    if (alreadyAdded) return false;

    // 부위 필터
    if (selectedPartFilter && workout.part !== selectedPartFilter) return false;
    // 기구 필터
    if (selectedToolFilter && workout.tool !== selectedToolFilter) return false;

    return true;
  });

  // -------------------------------------
  // 모달 열고 닫기
  // -------------------------------------
  const openExerciseModal = () => setIsExerciseModalOpen(true);
  const closeExerciseModal = () => setIsExerciseModalOpen(false);

  const openPreviousModal = () => setIsPreviousModalOpen(true);
  const closePreviousModal = () => setIsPreviousModalOpen(false);

  const toggleRecentExercisesVisibility = () => {
    setShowRecentExercises((prev) => !prev);
  };

  // -------------------------------------
  // 모달 내 운동 선택
  // -------------------------------------
  const toggleSelectedWorkout = (workoutId) => {
    setSelectedWorkouts((prev) =>
      prev.includes(workoutId)
        ? prev.filter((id) => id !== workoutId)
        : [...prev, workoutId]
    );
  };

  const handleWorkoutSelection = () => {
    if (selectedWorkouts.length === 0) {
      alert('운동을 하나 이상 선택해주세요!');
      return;
    }
    // 선택된 운동들 추가
    setDiary((prev) => {
      const newDiaryWorkouts = [...prev.diaryWorkouts];
      selectedWorkouts.forEach((wid) => {
        newDiaryWorkouts.push({
          diaryWorkoutId: null,
          workoutId: wid,
          deleted: false,
          sets: [
            {
              workoutSetId: null,
              weight: 10,
              repetition: 10,
              workoutTime: 10,
              deleted: false,
            },
          ],
        });
      });
      return { ...prev, diaryWorkouts: newDiaryWorkouts };
    });

    setSelectedWorkouts([]);
    closeExerciseModal();
  };

  // -------------------------------------
  // 이전 기록/최근 운동에서 추가
  // -------------------------------------
  const handleAddRecord = (record) => {
    setDiary((prev) => {
      const newDiaryWorkouts = [...prev.diaryWorkouts];

      record.workoutIds.forEach((wid) => {
        // 이미 추가되어 있지 않은 경우에만
        if (!newDiaryWorkouts.some((dw) => dw.workoutId === wid && !dw.deleted)) {
          // 해당 wid에 맞는 세트들
          const setsForThisWorkout = record.sets
            .filter((s) => s.workoutId === wid)
            .map((s) => ({
              workoutSetId: null,
              weight: s.weight || 10,
              repetition: s.repetition || 10,
              workoutTime: s.workoutTime || 10,
              deleted: false,
            }));

          // 세트가 없으면 기본 1세트
          const finalSets =
            setsForThisWorkout.length > 0
              ? setsForThisWorkout
              : [
                  {
                    workoutSetId: null,
                    weight: 10,
                    repetition: 10,
                    workoutTime: 10,
                    deleted: false,
                  },
                ];

          newDiaryWorkouts.push({
            diaryWorkoutId: null,
            workoutId: wid,
            deleted: false,
            sets: finalSets,
          });
        }
      });

      return { ...prev, diaryWorkouts: newDiaryWorkouts };
    });

    alert(`"${record.workoutName}" 운동들이 추가되었습니다.`);
    closePreviousModal();
  };

  // -------------------------------------
  // 음성 녹음 (미구현)
  // -------------------------------------
  const handleRecordButton = async () => {
    alert('녹음 기능은 아직 구현되지 않았습니다!');
  };

  // -------------------------------------
  // (UI) 운동 삭제 / 세트 추가,삭제 / 수정
  // -------------------------------------
  const handleDeleteWorkout = (idx) => {
    setDiary((prev) => {
      const newDiaryWorkouts = [...prev.diaryWorkouts];
      // 실제 삭제 대신 deleted: true 처리
      newDiaryWorkouts[idx] = {
        ...newDiaryWorkouts[idx],
        deleted: true,
        sets: newDiaryWorkouts[idx].sets.map((s) => ({ ...s, deleted: true })),
      };
      return { ...prev, diaryWorkouts: newDiaryWorkouts };
    });
  };

  const handleAddSet = (wIndex) => {
    setDiary((prev) => {
      const newDiaryWorkouts = [...prev.diaryWorkouts];
      newDiaryWorkouts[wIndex] = {
        ...newDiaryWorkouts[wIndex],
        sets: [
          ...newDiaryWorkouts[wIndex].sets,
          {
            workoutSetId: null,
            weight: 10,
            repetition: 10,
            workoutTime: 10,
            deleted: false,
          },
        ],
      };
      return { ...prev, diaryWorkouts: newDiaryWorkouts };
    });
  };

  const handleDeleteSet = (wIndex, sIndex) => {
    setDiary((prev) => {
      const newDiaryWorkouts = [...prev.diaryWorkouts];
      const newSets = [...newDiaryWorkouts[wIndex].sets];
      newSets[sIndex] = { ...newSets[sIndex], deleted: true };
      newDiaryWorkouts[wIndex] = { ...newDiaryWorkouts[wIndex], sets: newSets };
      return { ...prev, diaryWorkouts: newDiaryWorkouts };
    });
  };

  const handleWorkoutSetChange = (wIndex, sIndex, field, value) => {
    setDiary((prev) => {
      const newDiaryWorkouts = [...prev.diaryWorkouts];
      const newSets = [...newDiaryWorkouts[wIndex].sets];
      newSets[sIndex] = { ...newSets[sIndex], [field]: Number(value) };
      newDiaryWorkouts[wIndex] = { ...newDiaryWorkouts[wIndex], sets: newSets };
      return { ...prev, diaryWorkouts: newDiaryWorkouts };
    });
  };

  // -------------------------------------
  // 기존 이미지 제거
  // -------------------------------------
  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // -------------------------------------
  // 새 이미지 업로드
  // -------------------------------------
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const maxSize = 1 * 1024 * 1024; // 1MB

    // 용량 체크
    for (let file of selectedFiles) {
      if (file.size > maxSize) {
        alert(`파일 용량이 너무 큽니다: ${file.name}`);
        return;
      }
    }

    // 개수 체크 (기존 + 새 파일 합계 <= 6)
    if (existingImages.length + files.length + selectedFiles.length > 6) {
      alert('이미지는 최대 6장까지 업로드할 수 있습니다.');
      return;
    }

    setFiles((prev) => [...prev, ...selectedFiles]);
    const newPreviews = selectedFiles.map((f) => URL.createObjectURL(f));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // -------------------------------------
  // PATCH (수정) 요청
  // -------------------------------------
  const handleDiaryUpdate = async () => {
    if (!diary.diaryId) {
      alert('수정할 일지 ID가 없습니다!');
      return;
    }

    const formData = new FormData();

    // (1) diary JSON
    const diaryBlob = new Blob([JSON.stringify(diary)], { type: 'application/json' });
    formData.append('diary', diaryBlob);

    // (2) 유지할 기존 이미지들의 url
    const urlsBlob = new Blob([JSON.stringify(existingImages.map((img) => img.url))], {
      type: 'application/json',
    });
    formData.append('urls', urlsBlob);

    // (3) 새 이미지 파일들
    files.forEach((file) => {
      formData.append('files', file);
    });

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

  // -------------------------------------
  // 해시태그 추가
  // -------------------------------------
  const handleAddHashtag = () => {
    const tag = newHashtag.trim();
    if (tag && !diary.hashtags.includes(tag)) {
      setDiary((prev) => ({ ...prev, hashtags: [...prev.hashtags, tag] }));
      setNewHashtag('');
    }
  };

  // Helper: workoutId → 운동 이름
  const getWorkoutName = (workoutId) => {
    const found = allWorkoutList.find((w) => w.workoutId === workoutId);
    return found ? found.workoutName : `운동ID: ${workoutId}`;
  };

  // -------------------------------------
  // 렌더링
  // -------------------------------------
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
                placeholder="운동 검색"
                className="w-full p-2 border rounded mb-4"
                value={searchKeyword}
                onChange={(e) => handleSearch(e.target.value)}
              />

              {/* 최근 운동 (토글) */}
              <div className="mb-4">
                <button
                  onClick={toggleRecentExercisesVisibility}
                  className="px-4 py-2 bg-purple-500 text-white rounded"
                >
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

              {/* 필터된 운동 목록 */}
              <div className="space-y-2 max-h-60 overflow-y-auto border-t pt-2">
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

              {/* 하단 버튼들 */}
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={closeExerciseModal}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  취소
                </button>
                <button
                  onClick={handleWorkoutSelection}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
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
                {previousRecords.length === 0 ? (
                  <p>이전 기록이 없습니다.</p>
                ) : (
                  previousRecords.map((record, idx) => (
                    <div
                      key={`prev-${record.diaryWorkoutId || idx}`}
                      className="p-2 border-b cursor-pointer"
                      onClick={() => handleAddRecord(record)}
                    >
                      <p className="text-sm">
                        {record.workoutDate} - {record.workoutName}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={closePreviousModal}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 이미 추가된 운동 목록 */}
        <div className="mt-4">
          {diary.diaryWorkouts
            .filter((dw) => !dw.deleted)
            .map((workout, wIndex) => (
              <div key={`dw-${wIndex}`} className="border p-2 rounded mb-2">
                <div className="flex justify-between items-center">
                  <h2>{getWorkoutName(workout.workoutId)}</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAddSet(wIndex)}
                      className="px-2 py-1 bg-green-500 text-white rounded"
                    >
                      +세트
                    </button>
                    <button
                      onClick={() => handleDeleteWorkout(wIndex)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      🗑️운동
                    </button>
                  </div>
                </div>

                {workout.sets
                  .filter((s) => !s.deleted)
                  .map((set, setIndex) => (
                    <div
                      key={`set-${wIndex}-${setIndex}`}
                      className="flex items-center space-x-4 mt-2"
                    >
                      <div>
                        <label className="mr-1">무게:</label>
                        <input
                          type="number"
                          value={set.weight}
                          onChange={(e) =>
                            handleWorkoutSetChange(wIndex, setIndex, 'weight', e.target.value)
                          }
                          className="w-20 p-1 border rounded"
                        />
                      </div>
                      <div>
                        <label className="mr-1">횟수:</label>
                        <input
                          type="number"
                          value={set.repetition}
                          onChange={(e) =>
                            handleWorkoutSetChange(wIndex, setIndex, 'repetition', e.target.value)
                          }
                          className="w-20 p-1 border rounded"
                        />
                      </div>
                      <div>
                        <label className="mr-1">시간:</label>
                        <input
                          type="number"
                          value={set.workoutTime}
                          onChange={(e) =>
                            handleWorkoutSetChange(wIndex, setIndex, 'workoutTime', e.target.value)
                          }
                          className="w-20 p-1 border rounded"
                        />
                      </div>
                      <button
                        onClick={() => handleDeleteSet(wIndex, setIndex)}
                        className="px-2 py-1 bg-red-300 text-white rounded"
                      >
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
                  <img
                    src={img.url}
                    alt="existing"
                    className="w-full h-full object-cover rounded-md shadow-md"
                  />
                  <button
                    onClick={() => handleRemoveExistingImage(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white text-sm px-1 rounded"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 새 이미지 업로드 */}
        <div className="mt-4">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          <div className="flex flex-col">
            <label className="font-bold mb-2">새 이미지 첨부 (최대 6장)</label>
            <div className="flex flex-wrap gap-2">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="relative w-40 h-40">
                  <img
                    src={url}
                    alt="preview"
                    className="w-full h-full object-cover rounded-md shadow-md"
                  />
                  <button
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white text-sm px-1 rounded"
                  >
                    X
                  </button>
                </div>
              ))}
              {(() => {
                // 기존 + 새 이미지 합이 최대 6장
                const placeholdersCount = Math.max(
                  0,
                  6 - existingImages.length - previewUrls.length
                );
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

            <button
              className="mt-2 p-2 bg-blue-500 text-white rounded w-40"
              onClick={() => fileInputRef.current.click()}
            >
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

        {/* 해시태그 */}
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

        {/* 공개 범위 */}
        <div className="mt-2">
          <select
            value={diary.allowedScope}
            onChange={(e) => setDiary({ ...diary, allowedScope: e.target.value })}
          >
            <option value="A">모두 공개</option>
            <option value="M">비공개</option>
          </select>
        </div>

        {/* 수정 버튼 */}
        <button onClick={handleDiaryUpdate} className="mt-4 p-2 bg-gray-500 text-white rounded">
          수정하기
        </button>
      </div>
      <BottomBar />
    </>
  );
}
