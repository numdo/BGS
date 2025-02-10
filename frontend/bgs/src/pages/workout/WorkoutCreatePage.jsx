import { useState, useEffect, useRef } from "react";
import axiosInstance from "../../utils/axiosInstance";
import BottomBar from "../../components/bar/BottomBar";
import TopBar from "../../components/bar/TopBar";
import addlogo from "../../assets/icons/add.svg";
import miclogo from "../../assets/icons/mic.svg";
import deletelogo from "../../assets/icons/delete.svg";
import moreicon from "../../assets/icons/More.svg";

import { useNavigate } from "react-router-dom";

export default function WorkoutCreatePage() {
  const navigate = useNavigate();

  // ---------------------------
  // 0) 일지 상태
  // ---------------------------
  const [diary, setDiary] = useState({
    workoutDate: new Date().toISOString().split("T")[0],
    content: "",
    allowedScope: "A",
    hashtags: [],
    diaryWorkouts: [],
  });

  // ---------------------------
  // 1) 운동 목록 / 이전 기록 / 최근 운동
  // ---------------------------
  const [allWorkoutList, setAllWorkoutList] = useState([]);
  const [workoutList, setWorkoutList] = useState([]); // 검색/필터 결과
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
  const [searchKeyword, setSearchKeyword] = useState("");

  // 필터 (부위, 기구)
  const [selectedPartFilter, setSelectedPartFilter] = useState("");
  const [selectedToolFilter, setSelectedToolFilter] = useState("");

  // ---------------------------
  // 3) 이미지 업로드 관련 state
  // ---------------------------
  const [files, setFiles] = useState([]); // 여러 파일을 담을 배열
  const [previewUrls, setPreviewUrls] = useState([]); // 미리보기 URL 배열
  const fileInputRef = useRef(null);

  // 음성 녹음 관련
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunksRef = useRef([]);
  const [recordStartTime, setRecordStartTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 해시태그 입력값
  const [newHashtag, setNewHashtag] = useState("");

  // ---------------------------
  // 4) useEffect: 운동 목록, 이전 기록, 최근 운동 불러오기
  // ---------------------------
  useEffect(() => {
    // 로그인 토큰이 필요한 경우 확인 (interceptors에서 자동으로 헤더 붙임)
    const token = localStorage.getItem("accessToken");
    if (!token) {
      // 로그인이 안 되어 있으면 필요 시 처리 (alert, navigate 등)
      console.log("로그인되지 않은 상태입니다.");
    }

    // (1) 운동 목록
    axiosInstance
      .get("/diaries/workout", { withCredentials: true })
      .then((res) => {
        setAllWorkoutList(res.data);
        setWorkoutList(res.data); // 초기 상태
      })
      .catch((err) => console.error("🚨 운동 목록 불러오기 실패:", err));

    // (2) 이전 기록
    axiosInstance
      .get("/diaries/workout/previous?limit=5", { withCredentials: true })
      .then((res) => setPreviousRecords(res.data))
      .catch((err) => console.error("🚨 이전 기록 불러오기 실패:", err));

    // (3) 최근 운동
    axiosInstance
      .get("/diaries/workout/recent?limit=20", { withCredentials: true })
      .then((res) => setRecentExercises(res.data))
      .catch((err) => console.error("🚨 최근 운동 불러오기 실패:", err));
  }, []);

  // ---------------------------
  // 5) 운동 목록 필터링
  // ---------------------------
  const filteredWorkoutList = workoutList.filter((workout) => {
    // 이미 diaryWorkouts에 있는 운동은 제외
    const alreadyInDiary = diary.diaryWorkouts.some(
      (dw) => dw.workoutId === workout.workoutId
    );
    if (alreadyInDiary) return false;

    // 부위 필터
    if (selectedPartFilter && workout.part !== selectedPartFilter) return false;
    // 기구 필터
    if (selectedToolFilter && workout.tool !== selectedToolFilter) return false;

    return true;
  });

  // ---------------------------
  // 6) 검색
  // ---------------------------
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

  // ---------------------------
  // 7) 모달 열기/닫기
  // ---------------------------
  const openExerciseModal = () => setIsExerciseModalOpen(true);
  const closeExerciseModal = () => setIsExerciseModalOpen(false);

  const openPreviousModal = () => setIsPreviousModalOpen(true);
  const closePreviousModal = () => setIsPreviousModalOpen(false);

  const toggleRecentExercisesVisibility = () => {
    setShowRecentExercises((prev) => !prev);
  };

  // ---------------------------
  // 8) 운동 추가 모달 내에서 운동 선택
  // ---------------------------
  const toggleSelectedWorkout = (workoutId) => {
    setSelectedWorkouts((prev) =>
      prev.includes(workoutId)
        ? prev.filter((id) => id !== workoutId)
        : [...prev, workoutId]
    );
  };

  const handleWorkoutSelection = () => {
    if (selectedWorkouts.length === 0) {
      alert("운동을 하나 이상 선택해주세요!");
      return;
    }
    // 선택된 운동들을 일지에 추가 (기본 세트 한 개씩)
    setDiary((prevDiary) => {
      const updatedDiaryWorkouts = [...prevDiary.diaryWorkouts];
      selectedWorkouts.forEach((wid) => {
        updatedDiaryWorkouts.push({
          workoutId: wid,
          sets: [{ weight: 10, repetition: 10, workoutTime: 10 }],
        });
      });
      return { ...prevDiary, diaryWorkouts: updatedDiaryWorkouts };
    });

    // 초기화 후 닫기
    setSelectedWorkouts([]);
    closeExerciseModal();
  };

  // ---------------------------
  // 9) 이전 기록 / 최근 운동 클릭
  // ---------------------------
  const handleAddRecord = (record) => {
    setDiary((prevDiary) => {
      const newDiaryWorkouts = [...prevDiary.diaryWorkouts];

      // record.workoutIds에 들어있는 모든 운동을 순회
      record.workoutIds.forEach((wid) => {
        // 이미 추가돼 있는 운동이면 중복 방지
        const exists = newDiaryWorkouts.some((dw) => dw.workoutId === wid);
        if (!exists) {
          // 이 workoutId에 해당하는 세트만 필터
          const setsForThisWorkout = record.sets
            .filter((s) => s.workoutId === wid)
            .map((s) => ({
              weight: s.weight || 10,
              repetition: s.repetition || 10,
              workoutTime: s.workoutTime || 10,
            }));

          // 세트가 0개라면 기본값 1세트
          const finalSets =
            setsForThisWorkout.length > 0
              ? setsForThisWorkout
              : [{ weight: 10, repetition: 10, workoutTime: 10 }];

          newDiaryWorkouts.push({
            workoutId: wid,
            sets: finalSets,
          });
        }
      });

      return { ...prevDiary, diaryWorkouts: newDiaryWorkouts };
    });

    alert(`"${record.workoutName}" 운동들이 추가되었습니다.`);
    closePreviousModal(); // 모달 닫기
  };

  // ---------------------------
  // 10) 음성 녹음
  // ---------------------------
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
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          const duration = Date.now() - recordStartTime;
          if (duration < 2000 || audioBlob.size < 5000) {
            alert("녹음이 너무 짧습니다. 다시 시도해주세요.");
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

            console.log("📦 STT 응답 데이터:", response.data);

            if (response.data.invalidInput) {
              alert("운동을 인식하지 못했습니다. 다시 말씀해주세요.");
              return;
            }

            if (response.data.diaryWorkouts) {
              setDiary((prevDiary) => {
                const newDiaryWorkouts = [...prevDiary.diaryWorkouts];
                for (const dw of response.data.diaryWorkouts) {
                  if (
                    !newDiaryWorkouts.some((x) => x.workoutId === dw.workoutId)
                  ) {
                    newDiaryWorkouts.push(dw);
                  }
                }
                return { ...prevDiary, diaryWorkouts: newDiaryWorkouts };
              });
            }
          } catch (err) {
            alert("🚨 오류 발생! 운동을 인식할 수 없습니다.");
            console.error("음성 처리 실패:", err);
          }
          setIsLoading(false);
        };

        recorder.start();
        setIsRecording(true);
      } catch (error) {
        alert("🚨 마이크 접근 오류! 마이크 사용 권한을 확인해주세요.");
        console.error("마이크 접근 오류:", error);
      }
    } else {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // ---------------------------
  // 11) 운동 삭제 / 세트 추가 삭제 / 세트 수정
  // ---------------------------
  const handleDeleteWorkout = (idx) => {
    setDiary((prevDiary) => ({
      ...prevDiary,
      diaryWorkouts: prevDiary.diaryWorkouts.filter((_, i) => i !== idx),
    }));
  };

  const handleAddSet = (wIndex) => {
    setDiary((prevDiary) => {
      const newDiaryWorkouts = [...prevDiary.diaryWorkouts];
      newDiaryWorkouts[wIndex] = {
        ...newDiaryWorkouts[wIndex],
        sets: [
          ...newDiaryWorkouts[wIndex].sets,
          { weight: 10, repetition: 10, workoutTime: 10 },
        ],
      };
      return { ...prevDiary, diaryWorkouts: newDiaryWorkouts };
    });
  };

  const handleDeleteSet = (wIndex, sIndex) => {
    setDiary((prevDiary) => {
      const newDiaryWorkouts = [...prevDiary.diaryWorkouts];
      newDiaryWorkouts[wIndex] = {
        ...newDiaryWorkouts[wIndex],
        sets: newDiaryWorkouts[wIndex].sets.filter((_, i) => i !== sIndex),
      };
      return { ...prevDiary, diaryWorkouts: newDiaryWorkouts };
    });
  };

  const handleWorkoutSetChange = (wIndex, sIndex, field, value) => {
    setDiary((prevDiary) => {
      const newDiaryWorkouts = [...prevDiary.diaryWorkouts];
      newDiaryWorkouts[wIndex] = {
        ...newDiaryWorkouts[wIndex],
        sets: newDiaryWorkouts[wIndex].sets.map((set, i) => {
          if (i === sIndex) {
            return { ...set, [field]: Number(value) };
          }
          return set;
        }),
      };
      return { ...prevDiary, diaryWorkouts: newDiaryWorkouts };
    });
  };

  // ---------------------------
  // 12) 이미지 업로드
  // ---------------------------
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const maxAllowedSize = 1 * 1024 * 1024; // 예: 1MB 제한

    // 업로드할 새 파일들 중에서 제한 초과 파일이 있는지 확인
    for (let file of selectedFiles) {
      if (file.size > maxAllowedSize) {
        alert(`파일이 너무 큽니다: ${file.name}`);
        return;
      }
    }

    // 기존에 업로드된 파일 + 새로 선택된 파일이 6장을 초과하면 제한
    if (selectedFiles.length + files.length > 6) {
      alert("이미지는 최대 6장까지 업로드할 수 있습니다.");
      return;
    }

    setFiles((prev) => [...prev, ...selectedFiles]);
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  // 개별 이미지 삭제
  const handleRemoveImage = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // ---------------------------
  // 13) 운동일지 저장
  // ---------------------------
  const handleDiarySubmit = async (e) => {
    e.preventDefault();

    // 로그인 여부 확인
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append(
      "diary",
      new Blob([JSON.stringify(diary)], { type: "application/json" })
    );
    files.forEach((f) => formData.append("files", f)); // 이미지 파일들 추가

    try {
      await axiosInstance.post("/diaries", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      alert("✅ 운동 데이터 저장 완료!");
      navigate("/workout");
    } catch (error) {
      console.error("❌ 저장 오류:", error);
      if (error.response && error.response.status === 401) {
        alert("로그인이 필요합니다.");
        navigate("/login");
      } else {
        alert("🚨 저장 실패!");
      }
    }
  };

  // ---------------------------
  // 14) 해시태그 추가
  // ---------------------------
  const handleAddHashtag = () => {
    if (newHashtag.trim() && !diary.hashtags.includes(newHashtag)) {
      setDiary((prev) => ({
        ...prev,
        hashtags: [...prev.hashtags, newHashtag.trim()],
      }));
      setNewHashtag("");
    }
  };

  // ---------------------------
  // 15) Helper: workoutId -> 운동 이름
  // ---------------------------
  const getWorkoutName = (workoutId) => {
    const found = allWorkoutList.find((w) => w.workoutId === workoutId);
    return found ? found.workoutName : workoutId;
  };

  // ---------------------------
  // 렌더링
  // ---------------------------
  return (
    <>
      <TopBar />

      <div className="m-5 pb-24 flex-col relative">
        <button
          className="absolute right-0 bg-gray-100 rounded-md w-6 h-6"
          onClick={() => {}}
        >
          <img src={moreicon} alt="" />
        </button>
        {/* 날짜 */}
        <div className="border border-gray-100 text-gray-500 w-44 rounded-md pl-2">
          <label htmlFor="date">날짜 </label>
          <input
            type="date"
            id="date"
            value={diary.workoutDate}
            onChange={(e) =>
              setDiary({ ...diary, workoutDate: e.target.value })
            }
          />
        </div>

        {/* 상단 버튼들 */}
        <div className="flex items-center mt-3 rounded-lg">
          <button
            onClick={openExerciseModal}
            className="px-4 py-2 bg-primary-light text-white text-sm rounded-l-md"
          >
            🏋️‍♂️ 운동 추가
          </button>
          <button
            onClick={handleRecordButton}
            className="flex items-center px-4 py-2 bg-primary-light border-l border-gray-400  text-white text-sm rounded-r-md"
          >
            <img src={miclogo} alt="녹음 버튼" className="w-5 h-5" />
            {isRecording ? "⏹ 녹음 중..." : "🎙 녹음"}
          </button>
        </div>
        <button
          onClick={openPreviousModal}
          className="m-3 p-2 bg-gray-200 text-gray-500 rounded text-sm"
        >
          이전 기록 보기
        </button>

        {/* 운동 추가 모달 */}
        {isExerciseModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-2xl w-full">
              <h2 className="text-xl font-bold mb-4">운동 추가하기</h2>

              {/* 부위 필터 */}
              <div className="mb-2">
                <span className="mr-2 font-semibold">부위: </span>
                <button
                  onClick={() => setSelectedPartFilter("")}
                  className={`mr-2 px-2 py-1 border rounded ${
                    selectedPartFilter === ""
                      ? "bg-primary-light text-white"
                      : ""
                  }`}
                >
                  전체
                </button>
                {[...new Set(allWorkoutList.map((w) => w.part))].map((part) => (
                  <button
                    key={`part-${part}`}
                    onClick={() => setSelectedPartFilter(part)}
                    className={`mr-2 px-2 py-1 border rounded ${
                      selectedPartFilter === part
                        ? "bg-primary-light text-white"
                        : ""
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
                  onClick={() => setSelectedToolFilter("")}
                  className={`mr-2 px-2 py-1 border rounded ${
                    selectedToolFilter === ""
                      ? "bg-primary-light text-white"
                      : ""
                  }`}
                >
                  전체
                </button>
                {[...new Set(allWorkoutList.map((w) => w.tool))].map((tool) => (
                  <button
                    key={`tool-${tool}`}
                    onClick={() => setSelectedToolFilter(tool)}
                    className={`mr-2 px-2 py-1 border rounded ${
                      selectedToolFilter === tool
                        ? "bg-primary-light text-white"
                        : ""
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
                  className="px-4 py-2 bg-gray-200 text-gray-600 rounded"
                >
                  {showRecentExercises ? "최근 운동 숨기기" : "최근 운동 보기"}
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
          {diary.diaryWorkouts.map((workout, wIndex) => (
            <div key={`dw-${wIndex}`} className="border p-2 rounded mb-2">
              <div className="flex justify-between items-center">
                <h2>{getWorkoutName(workout.workoutId)}</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddSet(wIndex)}
                    className="w-8 px-2 py-1 bg-success text-gray-400 rounded"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleDeleteWorkout(wIndex)}
                    className="px-1 py-1 bg-danger text-white rounded"
                  >
                    <img src={deletelogo} alt="" />
                  </button>
                </div>
              </div>

              {workout.sets.map((set, setIndex) => (
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
                        handleWorkoutSetChange(
                          wIndex,
                          setIndex,
                          "weight",
                          e.target.value
                        )
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
                        handleWorkoutSetChange(
                          wIndex,
                          setIndex,
                          "repetition",
                          e.target.value
                        )
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
                        handleWorkoutSetChange(
                          wIndex,
                          setIndex,
                          "workoutTime",
                          e.target.value
                        )
                      }
                      className="w-20 p-1 border rounded"
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteSet(wIndex, setIndex)}
                    className="px-1 py-1 bg-danger text-white rounded"
                  >
                    <img src={deletelogo} alt="" />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* 이미지 업로드 섹션 */}
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
            <label className="font-bold mb-2">이미지 업로드 (최대 6장)</label>

            <div className="flex flex-wrap gap-2 ">
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
              {Array.from({ length: 1 }).map((_, i) => (
                <div
                  key={`placeholder-${i}`}
                  className="w-40 h-40 bg-gray-200 rounded-md flex items-center justify-center cursor-pointer"
                  onClick={() => fileInputRef.current.click()}
                >
                  <img src={addlogo} alt="" />
                </div>
              ))}
            </div>
          </div>
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
          <button
            onClick={handleAddHashtag}
            className="p-2 bg-primary-light text-white rounded ml-2"
          >
            추가
          </button>
        </div>
        <div className="mt-2">
          {diary.hashtags.map((tag) => (
            <span
              key={tag}
              className="p-1 bg-gray-200 rounded-full text-sm mr-2"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* 공개 범위 설정 */}
        <div className="mt-2">
          <label className="flex items-center gap-2  cursor-pointer">
            <span className="text-sm font-medium ml-2 text-gray-500">
              피드에 공유
            </span>
            <input
              type="checkbox"
              checked={diary.allowedScope === "A"}
              onChange={() =>
                setDiary({
                  ...diary,
                  allowedScope: diary.allowedScope === "A" ? "M" : "A",
                })
              }
              className="peer hidden"
            />
            <div className="w-6 h-6 border-2 border-gray-500 rounded-full peer-checked:bg-primary transition-all"></div>
          </label>
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleDiarySubmit}
          className="w-full mt-4 p-2 bg-primary text-white rounded"
        >
          저장
        </button>
      </div>

      <BottomBar />
    </>
  );
}
