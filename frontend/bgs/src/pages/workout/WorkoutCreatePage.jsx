// src/pages/WorkoutCreatePage.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import BottomBar from "../../components/bar/BottomBar";
import TopBar from "../../components/bar/TopBar";
import addlogo from "../../assets/icons/add.svg";
import miclogo from "../../assets/icons/mic.svg";
import deletelogo from "../../assets/icons/delete.svg";
import moreicon from "../../assets/icons/more.svg";
import mic_colored from "../../assets/icons/mic_colored.svg";
import SttWorkoutGuide from "../../components/workout/SttWorkoutGuide";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  showConfirmAlert,
  showErrorAlert,
  showSuccessAlert,
} from "../../utils/toastrAlert";
import { getUser } from "../../api/User"; // 서버에서 최신 유저/코인 정보 가져오기
import useCoinStore from "../../stores/useCoinStore"; // 전역 코인 스토어 (Zustand)

export default function WorkoutCreatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedDate = location.state?.selectedDate;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setCoinCount } = useCoinStore();

  // 더보기 관련 상태
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  // STT 가이드 모달 관련 상태
  const [showSttGuide, setShowSttGuide] = useState(false);
  const [hideSttGuide, setHideSttGuide] = useState(
    localStorage.getItem("hideSttGuide") === "true"
  );

  // 일지 상태
  const [diary, setDiary] = useState({
    workoutDate: selectedDate
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "Asia/Seoul",
      })
      .replace(/\. /g, "-")
      .replace(".", ""),
    content: "",
    allowedScope: "A",
    hashtags: [],
    diaryWorkouts: [],
  });

  // 운동 목록 / 이전 기록 / 최근 운동
  const [allWorkoutList, setAllWorkoutList] = useState([]);
  const [workoutList, setWorkoutList] = useState([]);
  const [previousRecords, setPreviousRecords] = useState([]);
  const [recentExercises, setRecentExercises] = useState([]);

  // 모달 제어 및 선택된 운동 상태
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [isPreviousModalOpen, setIsPreviousModalOpen] = useState(false);
  const [showRecentExercises, setShowRecentExercises] = useState(false);
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedPartFilter, setSelectedPartFilter] = useState("");
  const [selectedToolFilter, setSelectedToolFilter] = useState("");

  // 이미지 업로드 관련
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);

  // 음성 녹음 관련 상태
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunksRef = useRef([]);
  const [recordStartTime, setRecordStartTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // 로딩 스피너 상태

  // 해시태그 입력
  const [newHashtag, setNewHashtag] = useState("");
  const maxInputLength = 255; // DB varchar(255)

  // Helper: 운동 타입 결정 함수
  // "time"  → part가 유산소 또는 스포츠
  // "repetitionOnly" → tool이 밴드 또는 맨몸 (단, 시간운동이 아닌 경우)
  // "weightRepetition" → 기본
  const getWorkoutType = (workoutId) => {
    const workout = allWorkoutList.find((w) => w.workoutId === workoutId);
    if (!workout) return "weightRepetition";
    if (workout.part === "유산소" || workout.part === "스포츠") return "time";
    if (workout.tool === "밴드" || workout.tool === "맨몸")
      return "repetitionOnly";
    return "weightRepetition";
  };

  // Helper: workoutId -> 운동 이름
  const getWorkoutName = (workoutId) => {
    const found = allWorkoutList.find((w) => w.workoutId === workoutId);
    return found ? found.workoutName : workoutId;
  };

  // 운동 목록, 이전 기록, 최근 운동 불러오기
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
    }
    axiosInstance
      .get("/diaries/workout", { withCredentials: true })
      .then((res) => {
        setAllWorkoutList(res.data);
        setWorkoutList(res.data);
      })
      .catch((err) => console.error("🚨 운동 목록 불러오기 실패:", err));

    axiosInstance
      .get("/diaries/workout/previous?limit=5", { withCredentials: true })
      .then((res) => setPreviousRecords(res.data))
      .catch((err) => console.error("🚨 이전 기록 불러오기 실패:", err));

    axiosInstance
      .get("/diaries/workout/recent?limit=20", { withCredentials: true })
      .then((res) => setRecentExercises(res.data))
      .catch((err) => console.error("🚨 최근 운동 불러오기 실패:", err));
  }, []);

  // 이전 페이지에서 전달한 state 확인
  useEffect(() => {
    if (location.state && location.state.openExerciseModal) {
      setIsExerciseModalOpen(true);
      if (location.state.preSelectedWorkoutId) {
        setSelectedWorkouts((prev) =>
          prev.includes(location.state.preSelectedWorkoutId)
            ? prev
            : [...prev, location.state.preSelectedWorkoutId]
        );
      }
      if (location.state.searchQuery) {
        setSearchKeyword(location.state.searchQuery);
        handleSearch(location.state.searchQuery);
      }
    }
  }, [location.state]);

  // 검색 핸들러
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

  // 모달 열기/닫기 핸들러
  const openExerciseModal = () => setIsExerciseModalOpen(true);
  const closeExerciseModal = () => setIsExerciseModalOpen(false);
  const openPreviousModal = () => setIsPreviousModalOpen(true);
  const closePreviousModal = () => setIsPreviousModalOpen(false);
  const toggleRecentExercisesVisibility = () =>
    setShowRecentExercises((prev) => !prev);

  // 운동 추가 모달 내 선택 핸들러
  const toggleSelectedWorkout = (workoutId) => {
    setSelectedWorkouts((prev) =>
      prev.includes(workoutId)
        ? prev.filter((id) => id !== workoutId)
        : [...prev, workoutId]
    );
  };

  // 운동 선택 시 diaryWorkouts에 추가
  const handleWorkoutSelection = () => {
    if (selectedWorkouts.length === 0) {
      showErrorAlert("운동을 한 가지 이상 추가해 주세요!");
      return;
    }
    setDiary((prevDiary) => {
      const updatedDiaryWorkouts = [...prevDiary.diaryWorkouts];
      selectedWorkouts.forEach((wid) => {
        const type = getWorkoutType(wid);
        let defaultSet;
        if (type === "time") {
          defaultSet = { workoutTime: 10 };
        } else if (type === "repetitionOnly") {
          defaultSet = { repetition: 10 };
        } else {
          defaultSet = { weight: 10, repetition: 10 };
        }
        updatedDiaryWorkouts.push({
          workoutId: wid,
          sets: [defaultSet],
        });
      });
      return { ...prevDiary, diaryWorkouts: updatedDiaryWorkouts };
    });
    setSelectedWorkouts([]);
    closeExerciseModal();
  };

  // 이전 기록 추가 핸들러 수정
  // 이전 기록 추가 핸들러 수정
  const handleAddRecord = (record) => {
    setDiary((prevDiary) => {
      const newDiaryWorkouts = [...prevDiary.diaryWorkouts];
      // record.workoutIds가 배열이거나 단일 workoutId일 수 있음
      const workoutIds = record.workoutIds
        ? record.workoutIds
        : record.workoutId
        ? [record.workoutId]
        : [];
      workoutIds.forEach((wid) => {
        // 이미 추가된 운동은 건너뛰기
        if (!newDiaryWorkouts.some((dw) => dw.workoutId === wid)) {
          const type = getWorkoutType(wid);
          let defaultSets = [];
          if (record.sets && record.sets.length > 0) {
            // 해당 운동에 해당하는 세트만 필터링
            const filteredSets = record.sets
              .filter((s) => s.workoutId === wid)
              .map(({ workoutId, createdAt, ...rest }) => rest);
            if (filteredSets.length > 0) {
              defaultSets = filteredSets;
            } else {
              // 해당 운동의 세트 정보가 없으면 타입에 따른 기본값 사용
              if (type === "time") {
                defaultSets = [{ workoutTime: 10 }];
              } else if (type === "repetitionOnly") {
                defaultSets = [{ repetition: 10 }];
              } else {
                defaultSets = [{ weight: 10, repetition: 10 }];
              }
            }
          } else {
            // record에 세트 정보가 전혀 없으면 기본값 사용
            if (type === "time") {
              defaultSets = [{ workoutTime: 10 }];
            } else if (type === "repetitionOnly") {
              defaultSets = [{ repetition: 10 }];
            } else {
              defaultSets = [{ weight: 10, repetition: 10 }];
            }
          }
          newDiaryWorkouts.push({
            workoutId: wid,
            sets: defaultSets,
          });
        }
      });
      return { ...prevDiary, diaryWorkouts: newDiaryWorkouts };
    });
    showSuccessAlert(`"${record.workoutName}" 운동들이 추가되었습니다.`);
    closePreviousModal();
  };

  // 음성 녹음 관련 핸들러
  const handleRecordButton = () => {
    setShowSttGuide(true);
  };

  const toggleRecording = () => {
    if (!isRecording) {
      startRecording();
    } else {
      if (mediaRecorder) {
        mediaRecorder.stop();
        setShowSttGuide(false);
      }
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
                if (
                  !newDiaryWorkouts.some((x) => x.workoutId === dw.workoutId)
                ) {
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
    startRecording();
  };

  // 운동 삭제 / 세트 추가/삭제 / 세트 수정 핸들러
  const handleDeleteWorkout = (idx) => {
    setDiary((prevDiary) => ({
      ...prevDiary,
      diaryWorkouts: prevDiary.diaryWorkouts.filter((_, i) => i !== idx),
    }));
  };

  // 세트 추가 핸들러 수정
  const handleAddSet = (wIndex) => {
    setDiary((prevDiary) => {
      const newDiaryWorkouts = [...prevDiary.diaryWorkouts];
      const currentSets = newDiaryWorkouts[wIndex].sets;
      let newSet;
      // 만약 이미 세트가 있다면 마지막 세트 값을 복사
      if (currentSets.length > 0) {
        newSet = { ...currentSets[currentSets.length - 1] };
      } else {
        // 없을 경우, workout 타입에 따른 기본값 사용
        const workoutId = newDiaryWorkouts[wIndex].workoutId;
        const type = getWorkoutType(workoutId);
        if (type === "time") {
          newSet = { workoutTime: 10 };
        } else if (type === "repetitionOnly") {
          newSet = { repetition: 10 };
        } else {
          newSet = { weight: 10, repetition: 10 };
        }
      }
      newDiaryWorkouts[wIndex] = {
        ...newDiaryWorkouts[wIndex],
        sets: [...newDiaryWorkouts[wIndex].sets, newSet],
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
        sets: newDiaryWorkouts[wIndex].sets.map((set, i) =>
          i === sIndex ? { ...set, [field]: Number(value) } : set
        ),
      };
      return { ...prevDiary, diaryWorkouts: newDiaryWorkouts };
    });
  };

  // 이미지 업로드 핸들러
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const maxAllowedSize = 20 * 1024 * 1024;
    for (let file of selectedFiles) {
      if (file.size > maxAllowedSize) {
        showErrorAlert(`파일이 너무 큽니다: ${file.name}`);
        return;
      }
    }
    if (selectedFiles.length + files.length > 6) {
      showErrorAlert("이미지는 최대 6장까지 업로드할 수 있습니다.");
      return;
    }
    setFiles((prev) => [...prev, ...selectedFiles]);
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);

    // 파일 입력값 초기화 -> 같은 파일도 다시 선택 가능하게 함
    e.target.value = "";
  };

  const handleRemoveImage = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // 해시태그 삭제 핸들러 추가
  const handleRemoveHashtag = (idx) => {
    setDiary((prev) => ({
      ...prev,
      hashtags: prev.hashtags.filter((_, index) => index !== idx),
    }));
  };

  // 운동일지 저장 핸들러
  // handleDiarySubmit 함수 내 수정 부분
  const handleDiarySubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!diary.content.trim()) {
      showErrorAlert("메모를 입력해주세요!");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      await showErrorAlert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    setIsSubmitting(true); // 제출 시작

    // diary 객체를 전송하기 전에 불필요한 필드를 제거한 sanitizedDiary 객체 생성
    const sanitizedDiary = {
      ...diary,
      diaryWorkouts: diary.diaryWorkouts.map((dw) => ({
        workoutId: dw.workoutId,
        // deleted 필드는 없을 경우 false로 기본값 지정
        deleted: dw.deleted || false,
        sets: dw.sets.map((s) => ({
          // WorkoutSetRequestDto에 필요한 필드만 남김
          weight: s.weight,
          repetition: s.repetition,
          workoutTime: s.workoutTime,
          deleted: s.deleted || false,
        })),
      })),
    };

    const formData = new FormData();
    formData.append(
      "diary",
      new Blob([JSON.stringify(sanitizedDiary)], { type: "application/json" })
    );
    files.forEach((f) => formData.append("files", f));

    try {
      await axiosInstance.post("/diaries", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      const userData = await getUser(0); // /users/me
      setCoinCount(userData.coin); // Zustand 스토어에 반영

      navigate("/workout", {
        state: {
          showSuccessMessage: "저장이 완료되었습니다",
          selectedDate: diary.workoutDate,
        },
      });
    } catch (error) {
      console.error("❌ 저장 오류:", error);
      if (error.response && error.response.status === 401) {
        await showErrorAlert("로그인이 필요합니다.");
        navigate("/login");
      } else {
        await showErrorAlert("🚨 저장 실패!");
      }
      setIsSubmitting(false);
    }
  };

  // 해시태그 추가 핸들러 (띄어쓰기는 제거)
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // 폼 제출 기본 동작 방지 (필요한 경우)
      handleAddHashtag();
    }
  };

  const handleAddHashtag = () => {
    if (newHashtag.trim() && !diary.hashtags.includes(newHashtag)) {
      setDiary((prev) => ({
        ...prev,
        hashtags: [...prev.hashtags, newHashtag.trim()],
      }));
      setNewHashtag("");
    }
  };

  return (
    <>
      <TopBar />
      <div className="m-5 pb-24 flex-col relative">
        {isMoreOpen && (
          <div className="absolute right-0 top-7 bg-white mt-2 p-2 border z-10 rounded-md">
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
            {/* 외부 녹음 버튼은 단순히 모달을 띄웁니다. */}
            <button
              onClick={handleRecordButton}
              className="flex items-center justify-center px-4 py-2 bg-primary-light border-l border-gray-400 text-white text-sm rounded-r-md"
            >
              <img src={miclogo} alt="녹음 버튼" className="w-5 h-5" />
              <span>녹음</span>
            </button>
          </div>
          <button
            className="bg-gray-100 rounded-md w-6 h-6 ml-3"
            onClick={() => setIsMoreOpen(!isMoreOpen)}
          >
            <img src={moreicon} alt="" />
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
            <div className="bg-white rounded shadow-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
              {/* 헤더 영역 */}
              <div className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">
                  운동 추가하기
                </h2>
                {/* 부위/기구 필터 */}
                <div className="mb-2">
                  <span className="mr-1 font-semibold text-sm sm:text-base">
                    부위:
                  </span>
                  <button
                    onClick={() => setSelectedPartFilter("")}
                    className={`mr-1 px-2 py-1 border rounded text-xs sm:text-sm ${
                      selectedPartFilter === ""
                        ? "bg-primary-light text-white"
                        : ""
                    }`}
                  >
                    전체
                  </button>
                  {[...new Set(allWorkoutList.map((w) => w.part))].map(
                    (part) => (
                      <button
                        key={`part-${part}`}
                        onClick={() => setSelectedPartFilter(part)}
                        className={`mr-1 px-2 py-1 border rounded text-xs sm:text-sm ${
                          selectedPartFilter === part
                            ? "bg-primary-light text-white"
                            : ""
                        }`}
                      >
                        {part}
                      </button>
                    )
                  )}
                </div>
                <div className="mb-2">
                  <span className="mr-1 font-semibold text-sm sm:text-base">
                    기구:
                  </span>
                  <button
                    onClick={() => setSelectedToolFilter("")}
                    className={`mr-1 px-2 py-1 border rounded text-xs sm:text-sm ${
                      selectedToolFilter === ""
                        ? "bg-primary-light text-white"
                        : ""
                    }`}
                  >
                    전체
                  </button>
                  {[...new Set(allWorkoutList.map((w) => w.tool))].map(
                    (tool) => (
                      <button
                        key={`tool-${tool}`}
                        onClick={() => setSelectedToolFilter(tool)}
                        className={`mr-1 px-2 py-1 border rounded text-xs sm:text-sm ${
                          selectedToolFilter === tool
                            ? "bg-primary-light text-white"
                            : ""
                        }`}
                      >
                        {tool}
                      </button>
                    )
                  )}
                </div>
                {/* 검색창 및 최근 운동 토글 */}
                <input
                  type="text"
                  placeholder="운동 검색"
                  className="w-full p-1 border rounded text-xs sm:text-sm mb-2"
                  value={searchKeyword}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <div className="mb-2">
                  <button
                    onClick={toggleRecentExercisesVisibility}
                    className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs sm:text-sm"
                  >
                    {showRecentExercises
                      ? "최근 운동 숨기기"
                      : "최근 운동 보기"}
                  </button>
                </div>
                {showRecentExercises && (
                  <div className="space-y-1 max-h-32 overflow-y-auto mb-2 border-t pt-2">
                    {recentExercises.map((exercise, idx) => (
                      <div
                        key={`recent-${exercise.diaryWorkoutId}-${idx}`}
                        className="p-1 border-b cursor-pointer text-xs"
                        onClick={() => handleAddRecord(exercise)}
                      >
                        {exercise.workoutName} ({exercise.tool})
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 콘텐츠 영역: 운동 목록 */}
              <div className="flex-1 overflow-y-auto px-6 border-t">
                <div className="space-y-2 pt-4">
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
              </div>

              {/* 푸터 영역: 버튼 */}
              <div className="p-4 border-t flex justify-end space-x-2">
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
                // 현재 운동의 타입 결정 (time, repetitionOnly, weightRepetition)
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
                        onClick={() => handleDeleteWorkout(wIndex)}
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

                          {/* 입력 필드 결정 */}
                          {type === "time" ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={set.workoutTime || ""}
                                onChange={(e) =>
                                  handleWorkoutSetChange(
                                    wIndex,
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
                                    wIndex,
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
                                      wIndex,
                                      setIndex,
                                      "weight",
                                      e.target.value
                                    )
                                  }
                                  className="w-16 p-1 text-center border rounded text-gray-900"
                                />
                                <span className="text-gray-600 text-sm">
                                  kg
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  value={set.repetition || ""}
                                  onChange={(e) =>
                                    handleWorkoutSetChange(
                                      wIndex,
                                      setIndex,
                                      "repetition",
                                      e.target.value
                                    )
                                  }
                                  className="w-16 p-1 text-center border rounded text-gray-900"
                                />
                                <span className="text-gray-600 text-sm">
                                  회
                                </span>
                              </div>
                            </div>
                          )}

                          {/* 세트 삭제 버튼 */}
                          <button
                            onClick={() => handleDeleteSet(wIndex, setIndex)}
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
                        onClick={() => handleAddSet(wIndex)}
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
              {previewUrls.length < 6 && (
                <div
                  className="flex-shrink-0 w-40 h-40 bg-gray-200 rounded-md flex items-center justify-center cursor-pointer"
                  onClick={() => fileInputRef.current.click()}
                >
                  <img src={addlogo} alt="추가 버튼" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 운동일지 내용 (글자수 제한 및 크기 조절 못하도록 설정) */}
        <div className="mt-4">
          <textarea
            className="w-full h-24 mt-4 p-2 border rounded resize-none"
            value={diary.content}
            onChange={(e) => setDiary({ ...diary, content: e.target.value })}
            placeholder="메모를 입력해보세요"
            maxLength={255}
          />
          <div className="text-right text-xs text-gray-400">
            {diary.content.length}/255
          </div>
        </div>

        {/* 해시태그 추가 */}
        <div className="mt-1 flex items-start">
          <div className="relative">
            <input
              type="text"
              className="p-2 border rounded resize-none w-[15ch]"
              value={newHashtag}
              onChange={(e) => setNewHashtag(e.target.value.replace(/\s/g, ""))}
              onKeyDown={handleKeyDown}
              placeholder="해시태그 입력"
              maxLength={10}
            />
            {/* 입력창 바로 아래 우측 하단에 0/10 표시 */}
            <div className="absolute -bottom-5 right-0 text-xs text-gray-400">
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
        <div className="mt-6 flex flex-wrap gap-2">
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

        {/* 공개 범위 설정 */}
        <div className="flex gap-2 mt-4">
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

        {/* 저장 버튼 */}
        <button
          onClick={handleDiarySubmit}
          disabled={isSubmitting}
          className={`w-full mt-4 p-2 bg-primary text-white rounded ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? <LoadingSpinner size={20} color="#ffffff" /> : "저장"}
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
      {/* 로딩 스피너 - 녹음 종료 후 응답 대기 시 */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <LoadingSpinner />
        </div>
      )}
    </>
  );
}
