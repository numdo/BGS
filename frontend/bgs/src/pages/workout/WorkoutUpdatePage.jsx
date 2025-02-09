import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance'; 
import BottomBar from '../../components/bar/BottomBar';
import TopBar from '../../components/bar/TopBar';

export default function WorkoutUpdatePage() {
  const navigate = useNavigate();
  const { diaryId } = useParams(); // URL 파라미터

  // ---------------------------
  // 0) 수정할 일지 상태
  // ---------------------------
  const [diary, setDiary] = useState({
    diaryId: null, // 수정 대상
    workoutDate: '',
    content: '',
    allowedScope: 'A',
    hashtags: [],
    diaryWorkouts: [],
  });

  // **기존 이미지** 목록
  // 기존 이미지의 url, imageId 등을 담는 배열
  const [existingImages, setExistingImages] = useState([]);

  // ---------------------------
  // 1) 운동 목록 / 이전 기록 / 최근 운동
  // ---------------------------
  const [allWorkoutList, setAllWorkoutList] = useState([]);
  const [workoutList, setWorkoutList] = useState([]);
  const [previousRecords, setPreviousRecords] = useState([]);
  const [recentExercises, setRecentExercises] = useState([]);

  // 모달 제어
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [isPreviousModalOpen, setIsPreviousModalOpen] = useState(false);
  const [showRecentExercises, setShowRecentExercises] = useState(false);

  // 모달 내 운동 선택
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedPartFilter, setSelectedPartFilter] = useState('');
  const [selectedToolFilter, setSelectedToolFilter] = useState('');

  // ---------------------------
  // 2) 새로 첨부할 이미지(파일)
  // ---------------------------
  const [files, setFiles] = useState([]); // 새로 업로드할 파일
  const [previewUrls, setPreviewUrls] = useState([]); // 미리보기
  const fileInputRef = useRef(null);

  // 음성 녹음 관련 (필요 시)
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunksRef = useRef([]);
  const [recordStartTime, setRecordStartTime] = useState(0);

  // 해시태그 입력
  const [newHashtag, setNewHashtag] = useState('');

  // ---------------------------
  // 마운트 시 (일지 상세 + 운동 목록/이전기록/최근운동)
  // ---------------------------
  useEffect(() => {
    if (!diaryId) {
      alert('수정할 일지 ID가 없습니다.');
      navigate('/workout');
      return;
    }
    // 1) 기존 일지 불러오기
    fetchDiaryDetail(diaryId);
    // 2) 운동 목록 / 이전 기록 / 최근 운동
    fetchBaseData();
  }, [diaryId]);

  // 기존 일지 + 기존 이미지 불러오기
  const fetchDiaryDetail = async (id) => {
    try {
      const res = await axiosInstance.get(`/diaries/${id}`);
      const data = res.data;

      // 다이어리 정보
      setDiary({
        diaryId: data.diaryId,
        workoutDate: data.workoutDate,
        content: data.content,
        allowedScope: data.allowedScope,
        hashtags: data.hashtags,
        diaryWorkouts: data.diaryWorkouts || [],
      });

      // 기존 이미지 목록 (이미 서버에서 images 필드로 내려준다고 가정)
      if (data.images && data.images.length > 0) {
        // ex) [{ imageId, url, extension }, ...]
        setExistingImages(data.images);
      }
    } catch (err) {
      console.error('🚨 일지 불러오기 실패:', err);
      alert('일지를 불러오지 못했습니다.');
      navigate('/workout');
    }
  };

  // 운동 목록 / 이전 기록 / 최근 운동
  const fetchBaseData = async () => {
    try {
      // (1) 운동 목록
      const workoutRes = await axiosInstance.get('/diaries/workout');
      setAllWorkoutList(workoutRes.data);
      setWorkoutList(workoutRes.data);

      // (2) 이전 기록
      const prevRes = await axiosInstance.get('/diaries/workout/previous?limit=5');
      setPreviousRecords(prevRes.data);

      // (3) 최근 운동
      const recentRes = await axiosInstance.get('/diaries/workout/recent?limit=20');
      setRecentExercises(recentRes.data);
    } catch (err) {
      console.error('🚨 운동 목록/이전 기록/최근 운동 불러오기 실패:', err);
    }
  };

  // ---------------------------
  // 운동 목록 필터링
  // ---------------------------
  const filteredWorkoutList = workoutList.filter((workout) => {
    // 이미 diaryWorkouts에 있는지
    const alreadyInDiary = diary.diaryWorkouts.some((dw) => dw.workoutId === workout.workoutId);
    if (alreadyInDiary) return false;

    if (selectedPartFilter && workout.part !== selectedPartFilter) return false;
    if (selectedToolFilter && workout.tool !== selectedToolFilter) return false;
    return true;
  });

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

  // ---------------------------
  // 운동 추가 모달
  // ---------------------------
  const openExerciseModal = () => setIsExerciseModalOpen(true);
  const closeExerciseModal = () => setIsExerciseModalOpen(false);

  const openPreviousModal = () => setIsPreviousModalOpen(true);
  const closePreviousModal = () => setIsPreviousModalOpen(false);

  const toggleRecentExercisesVisibility = () => setShowRecentExercises((prev) => !prev);

  // 모달 내에서 운동 선택
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
    setDiary((prev) => {
      const updatedDiaryWorkouts = [...prev.diaryWorkouts];
      selectedWorkouts.forEach((wid) => {
        updatedDiaryWorkouts.push({
          workoutId: wid,
          sets: [{ weight: 10, repetition: 10, workoutTime: 10 }],
        });
      });
      return { ...prev, diaryWorkouts: updatedDiaryWorkouts };
    });
    setSelectedWorkouts([]);
    closeExerciseModal();
  };

  // 이전 기록 / 최근 운동
  const handleAddRecord = (record) => {
    setDiary((prev) => {
      const newDiaryWorkouts = [...prev.diaryWorkouts];
      record.workoutIds.forEach((wid) => {
        if (!newDiaryWorkouts.some((dw) => dw.workoutId === wid)) {
          const setsForThisWorkout = record.sets
            .filter((s) => s.workoutId === wid)
            .map((s) => ({
              weight: s.weight || 10,
              repetition: s.repetition || 10,
              workoutTime: s.workoutTime || 10,
            }));
          const finalSets = setsForThisWorkout.length
            ? setsForThisWorkout
            : [{ weight: 10, repetition: 10, workoutTime: 10 }];
          newDiaryWorkouts.push({ workoutId: wid, sets: finalSets });
        }
      });
      return { ...prev, diaryWorkouts: newDiaryWorkouts };
    });
    alert(`"${record.workoutName}" 운동들이 추가되었습니다.`);
    closePreviousModal();
  };

  // ---------------------------
  // 음성 녹음 (필요 시)
  // ---------------------------
  const handleRecordButton = async () => {
    // 생성 페이지와 동일하게 구현
  };

  // ---------------------------
  // 운동 삭제 / 세트 추가 / 세트 삭제 / 세트 값 수정
  // ---------------------------
  const handleDeleteWorkout = (idx) => {
    setDiary((prev) => ({
      ...prev,
      diaryWorkouts: prev.diaryWorkouts.filter((_, i) => i !== idx),
    }));
  };
  const handleAddSet = (wIndex) => {
    setDiary((prev) => {
      const newDiaryWorkouts = [...prev.diaryWorkouts];
      newDiaryWorkouts[wIndex] = {
        ...newDiaryWorkouts[wIndex],
        sets: [...newDiaryWorkouts[wIndex].sets, { weight: 10, repetition: 10, workoutTime: 10 }],
      };
      return { ...prev, diaryWorkouts: newDiaryWorkouts };
    });
  };
  const handleDeleteSet = (wIndex, sIndex) => {
    setDiary((prev) => {
      const newDiaryWorkouts = [...prev.diaryWorkouts];
      newDiaryWorkouts[wIndex] = {
        ...newDiaryWorkouts[wIndex],
        sets: newDiaryWorkouts[wIndex].sets.filter((_, i) => i !== sIndex),
      };
      return { ...prev, diaryWorkouts: newDiaryWorkouts };
    });
  };
  const handleWorkoutSetChange = (wIndex, sIndex, field, value) => {
    setDiary((prev) => {
      const newDiaryWorkouts = [...prev.diaryWorkouts];
      newDiaryWorkouts[wIndex] = {
        ...newDiaryWorkouts[wIndex],
        sets: newDiaryWorkouts[wIndex].sets.map((set, i) => {
          if (i === sIndex) return { ...set, [field]: Number(value) };
          return set;
        }),
      };
      return { ...prev, diaryWorkouts: newDiaryWorkouts };
    });
  };

  // ---------------------------
  // 기존 이미지 목록 관리
  // ---------------------------
  // 사용자가 기존 이미지를 삭제(버튼)하면, existingImages에서 제거
  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ---------------------------
  // 새로 업로드할 이미지
  // ---------------------------
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const maxAllowedSize = 1 * 1024 * 1024; // 1MB
    for (let file of selectedFiles) {
      if (file.size > maxAllowedSize) {
        alert(`파일이 너무 큽니다: ${file.name}`);
        return;
      }
    }
    if (selectedFiles.length + files.length > 6) {
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
  // 일지 수정(PATCH) 요청
  // ---------------------------
  const handleDiaryUpdate = async (e) => {
    e.preventDefault();
    if (!diary.diaryId) {
      alert('수정할 일지 ID가 없습니다.');
      return;
    }

    // 1) formData 구성
    const formData = new FormData();
    // diary JSON
    formData.append('diary', new Blob([JSON.stringify(diary)], { type: 'application/json' }));

    // 2) 유지할 기존 이미지들의 URL만 `urls` 파라미터로 넣어야 함
    //    서버에서는 이 url들이 존재하면 삭제 안 함, 없으면 삭제로직
    //    existingImages[*].url 은 서버가 제공한 S3 경로(혹은 getS3Url() 결과)라고 가정
    existingImages.forEach((img) => {
      // 서버에선 'urls' 파라미터를 List<String>으로 받으므로 반복문으로 append
      formData.append('urls', img.url);
    });

    // 3) 새로 추가할 파일들
    files.forEach((f) => formData.append('files', f));

    try {
      await axiosInstance.patch(`/diaries/${diary.diaryId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('✅ 운동 데이터 수정 완료!');
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
  // Helper: workoutId → 운동 이름
  // ---------------------------
  const getWorkoutName = (workoutId) => {
    const found = allWorkoutList.find((w) => w.workoutId === workoutId);
    return found ? found.workoutName : workoutId;
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
            {/* 운동 추가 모달 내용 (필터/검색/체크박스 → handleWorkoutSelection) */}
          </div>
        )}

        {/* 이전 기록 모달 */}
        {isPreviousModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            {/* 이전 기록 모달 내용 (record 클릭 → handleAddRecord) */}
          </div>
        )}

        {/* 이미 추가된 운동 목록 */}
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
                    🗑️
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
                  {/* 삭제 버튼 */}
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

        {/* 새로 업로드할 이미지 */}
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
                  {/* 삭제 버튼 */}
                  <button
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white text-sm px-1 rounded"
                  >
                    X
                  </button>
                </div>
              ))}
              {/* placeholder (빈 칸) */}
              {Array.from({ length: 6 - previewUrls.length }).map((_, i) => (
                <div
                  key={`placeholder-${i}`}
                  className="w-40 h-40 bg-gray-200 rounded-md flex items-center justify-center cursor-pointer"
                  onClick={() => fileInputRef.current.click()}
                >
                  <span className="text-gray-500">이미지 없음</span>
                </div>
              ))}
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
