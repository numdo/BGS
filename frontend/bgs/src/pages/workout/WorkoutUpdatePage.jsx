// src/pages/WorkoutUpdatePage.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import BottomBar from "../../components/bar/BottomBar";
import TopBar from "../../components/bar/TopBar";
import SttWorkoutGuide from "../../components/workout/SttWorkoutGuide";
import miclogo from "../../assets/icons/mic.svg";
import moreicon from "../../assets/icons/more.svg";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  showConfirmAlert,
  showErrorAlert,
  showSuccessAlert,
} from "../../utils/toastrAlert";

export default function WorkoutUpdatePage() {
  const navigate = useNavigate();
  const { diaryId } = useParams();

  // 0) 일지 상태 (수정용)
  const [diary, setDiary] = useState({
    diaryId: null,
    workoutDate: "",
    content: "",
    allowedScope: "A",
    hashtags: [],
    diaryWorkouts: [],
  });

  // 기존 이미지 목록
  const [existingImages, setExistingImages] = useState([]);

  // 1) 운동 목록 / 이전 기록 / 최근 운동
  const [allWorkoutList, setAllWorkoutList] = useState([]);
  const [workoutList, setWorkoutList] = useState([]);
  const [previousRecords, setPreviousRecords] = useState([]);
  const [recentExercises, setRecentExercises] = useState([]);

  // 2) 모달 제어 및 필터링
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [isPreviousModalOpen, setIsPreviousModalOpen] = useState(false);
  const [showRecentExercises, setShowRecentExercises] = useState(false);
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedPartFilter, setSelectedPartFilter] = useState("");
  const [selectedToolFilter, setSelectedToolFilter] = useState("");

  // 3) 새로 업로드할 이미지
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);

  // 4) 음성 녹음 관련 (STT)
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunksRef = useRef([]);
  const [recordStartTime, setRecordStartTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // STT 가이드 관련 상태
  const [showSttGuide, setShowSttGuide] = useState(false);
  const [hideSttGuide, setHideSttGuide] = useState(
    localStorage.getItem("hideSttGuide") === "true"
  );

  // 5) 해시태그 입력
  const [newHashtag, setNewHashtag] = useState("");

  // 추가: 더보기 드롭다운 상태
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // 헬퍼: 운동 타입 결정 함수  
  // "time" → part가 유산소 또는 스포츠  
  // "repetitionOnly" → tool이 밴드 또는 맨몸 (단, 시간운동이 아닌 경우)  
  // "weightRepetition" → 기본
  const getWorkoutType = (workoutId) => {
    const workout = allWorkoutList.find((w) => w.workoutId === workoutId);
    if (!workout) return "weightRepetition";
    if (workout.part === "유산소" || workout.part === "스포츠") return "time";
    if (workout.tool === "밴드" || workout.tool === "맨몸") return "repetitionOnly";
    return "weightRepetition";
  };

  // 헬퍼: workoutId -> 운동 이름
  const getWorkoutName = (workoutId) => {
    const found = allWorkoutList.find((w) => w.workoutId === workoutId);
    return found ? found.workoutName : workoutId;
  };

  useEffect(() => {
    if (!diaryId) {
      showErrorAlert("수정할 일지 ID가 없습니다.");
      navigate("/workout");
      return;
    }
    fetchDiaryDetail(diaryId);
    fetchBaseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diaryId]);

  const fetchDiaryDetail = async (id) => {
    try {
      const res = await axiosInstance.get(`/diaries/${id}`, {
        withCredentials: true,
      });
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
          sets: (dw.sets || []).map((s) => ({
            weight: s.weight,
            repetition: s.repetition,
            workoutTime: s.workoutTime,
          })),
        })),
      });
      if (data.images && data.images.length > 0) {
        setExistingImages(data.images);
      }
    } catch (err) {
      console.error("❌ 일지 불러오기 실패:", err);
      showErrorAlert("일지를 불러오지 못했습니다.");
      navigate("/workout");
    }
  };

  const fetchBaseData = async () => {
    try {
      const workoutRes = await axiosInstance.get("/diaries/workout", {
        withCredentials: true,
      });
      setAllWorkoutList(workoutRes.data);
      setWorkoutList(workoutRes.data);

      const prevRes = await axiosInstance.get(
        "/diaries/workout/previous?limit=5",
        { withCredentials: true }
      );
      setPreviousRecords(prevRes.data);

      const recentRes = await axiosInstance.get(
        "/diaries/workout/recent?limit=20",
        { withCredentials: true }
      );
      setRecentExercises(recentRes.data);
    } catch (err) {
      console.error("❌ 운동목록/이전기록/최근운동 조회 실패:", err);
    }
  };

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    if (keyword.trim() === "") {
      setWorkoutList(allWorkoutList);
    } else {
      const filtered = allWorkoutList.filter((w) =>
        w.workoutName.toLowerCase().includes(keyword.toLowerCase())
      );
      setWorkoutList(filtered);
    }
  };

  useEffect(() => {
    let filtered = allWorkoutList;
    if (searchKeyword.trim() !== "") {
      filtered = filtered.filter((w) =>
        w.workoutName.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }
    if (selectedPartFilter) {
      filtered = filtered.filter((w) => w.part === selectedPartFilter);
    }
    if (selectedToolFilter) {
      filtered = filtered.filter((w) => w.tool === selectedToolFilter);
    }
    setWorkoutList(filtered);
  }, [allWorkoutList, searchKeyword, selectedPartFilter, selectedToolFilter]);

  const openExerciseModal = () => setIsExerciseModalOpen(true);
  const closeExerciseModal = () => setIsExerciseModalOpen(false);
  const openPreviousModal = () => setIsPreviousModalOpen(true);
  const closePreviousModal = () => setIsPreviousModalOpen(false);
  const toggleRecentExercisesVisibility = () =>
    setShowRecentExercises((prev) => !prev);

  const toggleSelectedWorkout = (workoutId) => {
    setSelectedWorkouts((prev) =>
      prev.includes(workoutId)
        ? prev.filter((id) => id !== workoutId)
        : [...prev, workoutId]
    );
  };

  // 운동 선택 시 diaryWorkouts에 추가 (타입에 따라 기본 세트 값 결정)
  const handleWorkoutSelection = () => {
    if (selectedWorkouts.length === 0) {
      showErrorAlert("운동을 하나 이상 선택해주세요!");
      return;
    }
    setDiary((prevDiary) => {
      const newDiaryWorkouts = [
        ...prevDiary.diaryWorkouts,
        ...selectedWorkouts
          .filter(
            (wid) => !prevDiary.diaryWorkouts.some((dw) => dw.workoutId === wid)
          )
          .map((wid) => {
            const type = getWorkoutType(wid);
            let defaultSet;
            if (type === "time") {
              defaultSet = { workoutTime: 10 };
            } else if (type === "repetitionOnly") {
              defaultSet = { repetition: 10 };
            } else {
              defaultSet = { weight: 10, repetition: 10 };
            }
            return { workoutId: wid, sets: [defaultSet] };
          }),
      ];
      return { ...prevDiary, diaryWorkouts: newDiaryWorkouts };
    });
    setSelectedWorkouts([]);
    closeExerciseModal();
  };

  const handleAddRecord = (record) => {
    setDiary((prevDiary) => {
      const newDiaryWorkouts = [...prevDiary.diaryWorkouts];
      const workoutIds = record.workoutIds
        ? record.workoutIds
        : record.workoutId
        ? [record.workoutId]
        : [];
      workoutIds.forEach((wid) => {
        if (!newDiaryWorkouts.some((dw) => dw.workoutId === wid)) {
          const type = getWorkoutType(wid);
          let defaultSet;
          if (type === "time") {
            defaultSet = { workoutTime: 10 };
          } else if (type === "repetitionOnly") {
            defaultSet = { repetition: 10 };
          } else {
            defaultSet = { weight: 10, repetition: 10 };
          }
          newDiaryWorkouts.push({
            workoutId: wid,
            sets: [defaultSet],
          });
        }
      });
      return { ...prevDiary, diaryWorkouts: newDiaryWorkouts };
    });
    showSuccessAlert(`${record.workoutName} 운동들이 추가되었습니다.`);
    closePreviousModal();
  };

  // STT 녹음 관련 핸들러 (Create와 거의 동일)
  const handleRecordButton = () => {
    if (isRecording) {
      if (mediaRecorder) {
        mediaRecorder.stop();
      }
      setIsRecording(false);
      return;
    }
    if (!hideSttGuide) {
      setShowSttGuide(true);
    } else {
      toggleRecording();
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      startRecording();
    } else {
      if (mediaRecorder) {
        mediaRecorder.stop();
      }
      setIsRecording(false);
      setShowSttGuide(false);
    }
  };

  const startRecording = async () => {
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
      setIsRecording(true);
      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const duration = Date.now() - recordStartTime;
        if (duration < 2000 || audioBlob.size < 5000) {
          showErrorAlert("녹음이 너무 짧습니다. 다시 시도해주세요.");
          setIsRecording(false);
          setShowSttGuide(false);
          return;
        }
        setIsLoading(true);
        try {
          const formData = new FormData();
          formData.append("audioFile", audioBlob);
          const response = await axiosInstance.post(
            "/ai-diary/auto",
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
              withCredentials: true,
            }
          );
          console.log("STT 응답 데이터:", response.data);
          if (response.data.invalidInput) {
            showErrorAlert("운동을 인식하지 못했습니다. 다시 말씀해주세요.");
            setIsLoading(false);
            setIsRecording(false);
            setShowSttGuide(false);
            return;
          }
          if (response.data.diaryWorkouts) {
            setDiary((prevDiary) => {
              const newDiaryWorkouts = [...prevDiary.diaryWorkouts];
              response.data.diaryWorkouts.forEach((dw) => {
                if (!newDiaryWorkouts.some((x) => x.workoutId === dw.workoutId)) {
                  newDiaryWorkouts.push(dw);
                }
              });
              return { ...prevDiary, diaryWorkouts: newDiaryWorkouts };
            });
          }
        } catch (err) {
          showErrorAlert("오류 발생! 운동을 인식할 수 없습니다.");
          console.error("음성 처리 실패:", err);
        }
        setIsLoading(false);
        setIsRecording(false);
        setShowSttGuide(false);
      };
      recorder.start();
    } catch (error) {
      showErrorAlert("마이크 접근 오류! 마이크 사용 권한을 확인해주세요.");
      console.error("마이크 접근 오류:", error);
    }
  };

  const handleSttGuideCancel = () => {
    setShowSttGuide(false);
  };

  const handleSttGuideStart = (dontShowAgain) => {
    if (dontShowAgain) {
      localStorage.setItem("hideSttGuide", "true");
      setHideSttGuide(true);
    }
    setShowSttGuide(false);
    toggleRecording();
  };

  // 운동 삭제 / 세트 추가/삭제 / 세트 수정 핸들러
  const handleDeleteWorkout = (workoutId) => {
    setDiary((prevDiary) => ({
      ...prevDiary,
      diaryWorkouts: prevDiary.diaryWorkouts.filter(
        (dw) => dw.workoutId !== workoutId
      ),
    }));
  };

  const handleAddSet = (workoutId) => {
    setDiary((prevDiary) => {
      const idx = prevDiary.diaryWorkouts.findIndex(
        (dw) => dw.workoutId === workoutId
      );
      if (idx === -1) return prevDiary;
      const type = getWorkoutType(workoutId);
      let newSet;
      if (type === "time") {
        newSet = { workoutTime: 10 };
      } else if (type === "repetitionOnly") {
        newSet = { repetition: 10 };
      } else {
        newSet = { weight: 10, repetition: 10 };
      }
      const newDiaryWorkouts = [...prevDiary.diaryWorkouts];
      newDiaryWorkouts[idx] = {
        ...newDiaryWorkouts[idx],
        sets: [...newDiaryWorkouts[idx].sets, newSet],
      };
      return { ...prevDiary, diaryWorkouts: newDiaryWorkouts };
    });
  };

  const handleDeleteSet = (workoutId, setIndex) => {
    setDiary((prevDiary) => {
      const idx = prevDiary.diaryWorkouts.findIndex(
        (dw) => dw.workoutId === workoutId
      );
      if (idx === -1) return prevDiary;
      const newDiaryWorkouts = [...prevDiary.diaryWorkouts];
      newDiaryWorkouts[idx] = {
        ...newDiaryWorkouts[idx],
        sets: newDiaryWorkouts[idx].sets.filter((_, i) => i !== setIndex),
      };
      return { ...prevDiary, diaryWorkouts: newDiaryWorkouts };
    });
  };

  const handleWorkoutSetChange = (workoutId, setIndex, field, value) => {
    setDiary((prevDiary) => {
      const idx = prevDiary.diaryWorkouts.findIndex(
        (dw) => dw.workoutId === workoutId
      );
      if (idx === -1) return prevDiary;
      const newDiaryWorkouts = [...prevDiary.diaryWorkouts];
      newDiaryWorkouts[idx] = {
        ...newDiaryWorkouts[idx],
        sets: newDiaryWorkouts[idx].sets.map((s, i) =>
          i === setIndex ? { ...s, [field]: Number(value) } : s
        ),
      };
      return { ...prevDiary, diaryWorkouts: newDiaryWorkouts };
    });
  };

  // 이미지 업로드 관련 핸들러
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const maxAllowedSize = 1 * 1024 * 1024;
    for (let file of selectedFiles) {
      if (file.size > maxAllowedSize) {
        showErrorAlert(`파일이 너무 큽니다: ${file.name}`);
        return;
      }
    }
    if (existingImages.length + files.length + selectedFiles.length > 6) {
      showErrorAlert("이미지는 최대 6장까지 업로드할 수 있습니다.");
      return;
    }
    setFiles((prev) => [...prev, ...selectedFiles]);
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
  };

  const handleRemoveImage = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // 해시태그 추가 핸들러 (엔터키로도 추가)
  const handleAddHashtag = () => {
    const tag = newHashtag.trim();
    if (tag && !diary.hashtags.includes(tag)) {
      setDiary((prev) => ({ ...prev, hashtags: [...prev.hashtags, tag] }));
      setNewHashtag("");
    }
  };

  // 해시태그 엔터키 입력 핸들러
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddHashtag();
    }
  };

  // 해시태그 삭제 핸들러
  const handleRemoveHashtag = (idx) => {
    setDiary((prev) => ({
      ...prev,
      hashtags: prev.hashtags.filter((_, index) => index !== idx),
    }));
  };

  // 운동일지 수정 핸들러
  const handleDiaryUpdate = async () => {
    if (!diary.diaryId) {
      showErrorAlert("수정할 일지 ID가 없습니다!");
      return;
    }
    const formData = new FormData();
    const diaryBlob = new Blob([JSON.stringify(diary)], {
      type: "application/json",
    });
    formData.append("diary", diaryBlob);
    // 기존 이미지 url 목록 전달 (삭제된 이미지는 제외)
    const urlsBlob = new Blob(
      [JSON.stringify(existingImages.map((img) => img.url))],
      {
        type: "application/json",
      }
    );
    formData.append("urls", urlsBlob);
    files.forEach((f) => formData.append("files", f));
    try {
      await axiosInstance.patch(`/diaries/${diary.diaryId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      // 수정 성공 후 바로 /workout 페이지로 이동하면서 성공 메시지 전달
      navigate("/workout", { state: { showSuccessMessage: "✅ 수정 완료!" } });
    } catch (err) {
      console.error("❌ 수정 오류:", err);
      showErrorAlert("🚨 수정 실패!");
    }
  };

  return (
    <>
      <TopBar />
      <div className="m-5 pb-24 flex-col relative">
        {/* 더보기 드롭다운 */}
        {isMoreOpen && (
          <div className="absolute right-0 top-7 bg-white mt-2 p-2 border z-10 rounded-md">
            <div className="border border-gray-100 text-gray-500 w-44 rounded-md pl-2">
              <label htmlFor="date" className="text-sm">날짜</label>
              <input
                type="date"
                id="date"
                value={diary.workoutDate}
                onChange={(e) =>
                  setDiary({ ...diary, workoutDate: e.target.value })
                }
                className="w-full p-1 bg-transparent outline-none text-sm"
              />
            </div>
            <button
              onClick={() => setIsPreviousModalOpen(true)}
              className="w-44 h-10 flex justify-center items-center border border-gray-100 text-gray-500 rounded text-sm mt-2"
            >
              이전 기록 보기
            </button>
          </div>
        )}

        {/* 상단 버튼들 */}
        <div className="flex items-center">
          <div className="grid grid-cols-2 items-center rounded-lg flex-grow">
            <button
              onClick={() => setIsExerciseModalOpen(true)}
              className="px-4 py-2 bg-primary-light text-white text-sm rounded-l-md"
            >
              🏋️‍♂️ 운동 추가
            </button>
            <button
              onClick={handleRecordButton}
              className="flex items-center justify-center px-4 py-2 bg-primary-light border-l border-gray-400 text-white text-sm rounded-r-md"
            >
              <img src={miclogo} alt="녹음 버튼" className="w-5 h-5" />
              <span>{isRecording ? "녹음 중" : "녹음"}</span>
            </button>
          </div>
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className="bg-gray-100 rounded-md w-6 h-6 ml-3"
          >
            <img src={moreicon} alt="더보기" />
          </button>
        </div>

        {/* STT 가이드 모달 */}
        {showSttGuide && (
          <SttWorkoutGuide
            onCancel={handleSttGuideCancel}
            toggleRecording={toggleRecording}
            isRecording={isRecording}
          />
        )}

        {/* 운동 추가 모달 */}
        {isExerciseModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">운동 추가하기</h2>
              {/* 부위 필터 */}
              <div className="mb-2">
                <span className="mr-2 font-semibold">부위: </span>
                <button
                  onClick={() => setSelectedPartFilter("")}
                  className={`mr-2 px-2 py-1 border rounded ${selectedPartFilter === "" ? "bg-primary-light text-white" : ""}`}
                >
                  전체
                </button>
                {[...new Set(allWorkoutList.map((w) => w.part))].map((part) => (
                  <button
                    key={`part-${part}`}
                    onClick={() => setSelectedPartFilter(part)}
                    className={`mr-2 px-2 py-1 border rounded ${selectedPartFilter === part ? "bg-primary-light text-white" : ""}`}
                  >
                    {part}
                  </button>
                ))}
              </div>
              {/* 기구 필터 */}
              <div className="mb-2">
                <span className="mr-2 font-semibold">기구: </span>
                <button
                  onClick={() => setSelectedToolFilter("")}
                  className={`mr-2 px-2 py-1 border rounded ${selectedToolFilter === "" ? "bg-primary-light text-white" : ""}`}
                >
                  전체
                </button>
                {[...new Set(allWorkoutList.map((w) => w.tool))].map((tool) => (
                  <button
                    key={`tool-${tool}`}
                    onClick={() => setSelectedToolFilter(tool)}
                    className={`mr-2 px-2 py-1 border rounded ${selectedToolFilter === tool ? "bg-primary-light text-white" : ""}`}
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
                  className="px-4 py-2 bg-gray-200 text-gray-600 rounded"
                >
                  {showRecentExercises ? "최근 운동 숨기기" : "최근 운동 보기"}
                </button>
              </div>
              {showRecentExercises && (
                <div className="space-y-1 max-h-48 overflow-y-auto mb-4 border-t pt-2">
                  {recentExercises.map((exercise, idx) => (
                    <div
                      key={`recent-${idx}`}
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
                {workoutList.map((workout) => (
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
                      className="accent-primary"
                      checked={selectedWorkouts.includes(workout.workoutId)}
                      readOnly
                    />
                  </div>
                ))}
              </div>
              {/* 하단 버튼 */}
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={closeExerciseModal}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  취소
                </button>
                <button
                  onClick={handleWorkoutSelection}
                  className="px-4 py-2 bg-primary text-white rounded"
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
          {diary.diaryWorkouts.length === 0 ? (
            <p className="text-gray-500">운동을 추가해보세요</p>
          ) : (
            <>
              {diary.diaryWorkouts.map((workout, wIndex) => {
                const type = getWorkoutType(workout.workoutId);
                return (
                  <div
                    key={`dw-${wIndex}`}
                    className="border p-4 rounded-md mb-4 bg-white shadow"
                  >
                    {/* 운동명 및 삭제 버튼 */}
                    <div className="flex justify-between items-center pb-2 border-b">
                      <h2 className="text-base font-semibold text-gray-800">
                        {getWorkoutName(workout.workoutId)}
                      </h2>
                      <button
                        onClick={() => handleDeleteWorkout(workout.workoutId)}
                        className="text-gray-500 hover:text-red-500 text-lg"
                      >
                        ✖
                      </button>
                    </div>

                    {/* 세트 목록 */}
                    <div className="mt-3 space-y-2">
                      {workout.sets.map((set, setIndex) => (
                        <div
                          key={`set-${wIndex}-${setIndex}`}
                          className="flex items-center justify-between px-4 py-2 rounded-md bg-gray-100"
                        >
                          <span className="text-gray-700 font-medium text-sm">
                            {setIndex + 1}세트
                          </span>
                          {type === "time" ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={set.workoutTime || ""}
                                onChange={(e) =>
                                  handleWorkoutSetChange(
                                    workout.workoutId,
                                    setIndex,
                                    "workoutTime",
                                    e.target.value
                                  )
                                }
                                className="w-16 p-1 text-center border rounded text-gray-900"
                              />
                              <span className="text-gray-600 text-sm">분</span>
                            </div>
                          ) : type === "repetitionOnly" ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={set.repetition || ""}
                                onChange={(e) =>
                                  handleWorkoutSetChange(
                                    workout.workoutId,
                                    setIndex,
                                    "repetition",
                                    e.target.value
                                  )
                                }
                                className="w-16 p-1 text-center border rounded text-gray-900"
                              />
                              <span className="text-gray-600 text-sm">회</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  value={set.weight || ""}
                                  onChange={(e) =>
                                    handleWorkoutSetChange(
                                      workout.workoutId,
                                      setIndex,
                                      "weight",
                                      e.target.value
                                    )
                                  }
                                  className="w-16 p-1 text-center border rounded text-gray-900"
                                />
                                <span className="text-gray-600 text-sm">kg</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  value={set.repetition || ""}
                                  onChange={(e) =>
                                    handleWorkoutSetChange(
                                      workout.workoutId,
                                      setIndex,
                                      "repetition",
                                      e.target.value
                                    )
                                  }
                                  className="w-16 p-1 text-center border rounded text-gray-900"
                                />
                                <span className="text-gray-600 text-sm">회</span>
                              </div>
                            </div>
                          )}
                          <button
                            onClick={() =>
                              handleDeleteSet(workout.workoutId, setIndex)
                            }
                            className="text-gray-500 hover:text-red-500 text-lg"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* 세트 추가 버튼 */}
                    <div className="mt-3 flex justify-center">
                      <button
                        onClick={() => handleAddSet(workout.workoutId)}
                        className="w-full px-4 py-2 bg-[#5968eb] hover:bg-[#4a57c7] rounded-md text-white font-semibold text-sm"
                      >
                        세트 추가
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* 기존 이미지 목록 */}
        {existingImages.length > 0 && (
          <div className="mt-6">
            <label className="font-bold mb-2">기존 이미지</label>
            <div className="overflow-x-auto whitespace-nowrap flex gap-2">
              {existingImages.map((img, idx) => (
                <div
                  key={`existing-${img.imageId}`}
                  className="relative flex-shrink-0 w-40 h-40"
                >
                  <img
                    src={img.url}
                    alt="existing"
                    className="w-full h-full object-cover rounded-md shadow-md"
                  />
                  <button
                    onClick={() =>
                      setExistingImages((prev) =>
                        prev.filter((_, i) => i !== idx)
                      )
                    }
                    className="absolute top-1 right-1 bg-red-600 text-white text-sm px-1 rounded"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 새 이미지 업로드 섹션 */}
        <div className="mt-4">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            ref={fileInputRef}
            style={{ display: "none" }}
          />
          <div className="flex flex-col">
            <label className="font-bold mb-2">새 이미지 첨부 (최대 6장)</label>
            <div className="overflow-x-auto whitespace-nowrap flex gap-2">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="relative flex-shrink-0 w-40 h-40">
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
              {existingImages.length + previewUrls.length < 6 && (
                <div
                  className="flex-shrink-0 w-40 h-40 bg-gray-200 rounded-md flex items-center justify-center cursor-pointer"
                  onClick={() => fileInputRef.current.click()}
                >
                  <span className="text-2xl text-gray-500">+</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 운동일지 내용 */}
        <div className="mt-4">
          <textarea
            className="w-full h-24 mt-4 p-2 border rounded resize-none"
            value={diary.content}
            onChange={(e) =>
              setDiary({ ...diary, content: e.target.value })
            }
            placeholder="메모를 입력해보세요"
            maxLength={255}
          />
          <div className="text-right text-xs text-gray-400">
            {diary.content.length}/255
          </div>
        </div>

        {/* 해시태그 추가 */}
        <div className="mt-4">
          <div className="flex items-center">
            <div className="flex flex-col">
              <input
                type="text"
                className="p-2 border rounded resize-none w-[15ch]"
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value.replace(/\s/g, ""))}
                onKeyDown={handleKeyDown}
                placeholder="해시태그 입력"
                maxLength={10}
              />
              <div className="text-right text-xs text-gray-400">
                {newHashtag.length}/10
              </div>
            </div>
            <button
              onClick={handleAddHashtag}
              className="ml-2 p-2 bg-primary-light text-white rounded whitespace-nowrap"
            >
              추가
            </button>
          </div>

          {/* 해시태그 목록 (삭제 버튼 포함) */}
          <div className="mt-2 flex flex-wrap gap-2">
            {diary.hashtags.map((tag, idx) => (
              <div
                key={tag}
                className="relative bg-gray-200 rounded-full px-3 py-1 text-sm"
              >
                <span>#{tag}</span>
                <button
                  onClick={() => handleRemoveHashtag(idx)}
                  className="absolute top-[-5px] right-[-5px] bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 공개 범위 설정 */}
        <div className="flex gap-2 mt-2">
          <div className="flex items-center">
            <input
              type="radio"
              checked={diary.allowedScope === "A"}
              onChange={() => setDiary({ ...diary, allowedScope: "A" })}
            />
            <span className="ml-2 text-sm">공개</span>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              checked={diary.allowedScope === "M"}
              onChange={() => setDiary({ ...diary, allowedScope: "M" })}
            />
            <span className="ml-2 text-sm">비공개</span>
          </div>
        </div>

        {/* 수정 버튼 */}
        <button
          onClick={handleDiaryUpdate}
          className="w-full mt-4 p-2 bg-primary text-white rounded"
        >
          수정
        </button>
      </div>
      <BottomBar />
      {/* STT 가이드 모달 */}
      {showSttGuide && (
        <SttWorkoutGuide
          onCancel={handleSttGuideCancel}
          toggleRecording={toggleRecording}
          isRecording={isRecording}
        />
      )}
      {/* 로딩 스피너 */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <LoadingSpinner />
        </div>
      )}
    </>
  );
}
