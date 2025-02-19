import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import BottomBar from "../../components/bar/BottomBar";
import TopBar from "../../components/bar/TopBar";
import addlogo from "../../assets/icons/add.svg";
import { 
  showInformAlert
 } from "../../utils/toastrAlert";

export default function EvaluationUpdatePage() {
  const { evaluationId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [workoutType, setWorkoutType] = useState("BENCH");
  const [content, setContent] = useState("");
  const [weight, setWeight] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const response = await axiosInstance.get(`/evaluations/${evaluationId}`);
        const data = response.data;

        setWorkoutType(data.workoutType);
        setContent(data.content);
        setWeight(data.weight.toFixed(1));

        // 기존 영상이 있으면 미리보기 URL에 설정
        if (data.videoUrl) {
          setPreviewUrl(data.videoUrl);
        } else if (data.imageUrls && data.imageUrls.length > 0) {
          // imageUrls 배열이 존재하면, 첫 번째 항목이 영상 파일인지 확인
          const firstMedia = data.imageUrls[0];
          if (firstMedia.endsWith(".mp4") || firstMedia.endsWith(".webm")) {
            setPreviewUrl(firstMedia);
          }
        }
      } catch (error) {
        console.error("❌ 데이터 불러오기 오류:", error);
        alert("🚨 평가 정보를 불러오지 못했습니다.");
        navigate("/workout");
      }
    };

    fetchEvaluation();
  }, [evaluationId, navigate]);

  const handleWeightChange = (e) => {
    let value = e.target.value;
    if (!/^\d*\.?\d*$/.test(value)) return;

    if (value.includes(".")) {
      const parts = value.split(".");
      if (parts[1].length > 1) return;
    }

    if (parseFloat(value) > 999.9) return;
    setWeight(value);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const maxAllowedSize = 100 * 1024 * 1024; // 최대 100MB 제한

    if (!selectedFile) return;
    if (!selectedFile.type.startsWith("video/")) {
      alert("영상 파일만 업로드할 수 있습니다.");
      return;
    }
    if (selectedFile.size > maxAllowedSize) {
      alert(`파일이 너무 큽니다: ${selectedFile.name}`);
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  const handleEvaluationUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    if (!weight) {
      showInformAlert("중량을 입력하세요.");
      return;
    }

    if (!file && !previewUrl) {
      showInformAlert("파일을 입력하세요.");
      return;
    }

    const updates = { workoutType, content, weight };
    const formData = new FormData();
    formData.append(
      "updates",
      new Blob([JSON.stringify(updates)], { type: "application/json" })
    );

    // 새 파일이 있으면 업로드, 없으면 기존 미디어 URL을 전송 (하나의 값으로)
    if (file) {
      formData.append("newImages", file);
    } else if (previewUrl) {
      formData.append("existingImageUrls", previewUrl);
    }

    try {
      await axiosInstance.patch(`/evaluations/${evaluationId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      alert("✅ 평가 수정 완료!");
      navigate(`/feeds/evaluation/${evaluationId}`);
    } catch (error) {
      console.error("❌ 수정 오류:", error);
      alert("🚨 수정 실패!");
    }
  };

  return (
    <>
      <TopBar />
      <div className="m-5 pb-24 flex-col relative">
        <div className="mt-4">
          <label htmlFor="workoutType">운동 종류 </label>
          <select
            id="workoutType"
            value={workoutType}
            onChange={(e) => setWorkoutType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="BENCH">벤치 프레스</option>
            <option value="DEAD">데드리프트</option>
            <option value="SQUAT">스쿼트</option>
          </select>
        </div>

        <div className="mt-4">
          <label htmlFor="weight">중량 (kg)</label>
          <input
            id="weight"
            type="text"
            value={weight}
            onChange={handleWeightChange}
            placeholder="예: 100.5"
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mt-4">
          <input
            type="file"
            accept="video/mp4"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: "none" }}
          />
          <div className="flex flex-col">
            <label className="font-bold mb-2">영상 업로드 (1개만 가능)</label>
            <div className="flex flex-wrap gap-2">
              {previewUrl ? (
                <div className="relative w-40 h-40">
                  <video
                    src={previewUrl}
                    className="w-full h-full object-cover rounded-md shadow-md"
                    controls
                    playsInline
                    webkitplaysinline="true"
                    preload="metadata"
                  />
                  <button
                    onClick={handleRemoveFile}
                    className="absolute top-1 right-1 bg-red-600 text-white text-sm px-1 rounded"
                  >
                    X
                  </button>
                </div>
              ) : (
                <div
                  className="w-40 h-40 bg-gray-200 rounded-md flex items-center justify-center cursor-pointer"
                  onClick={() => fileInputRef.current.click()}
                >
                  <img src={addlogo} alt="추가 아이콘" />
                </div>
              )}
            </div>
          </div>
        </div>

        <textarea
          className="w-full h-24 mt-4 p-2 border rounded"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="운동일지 내용을 입력하세요."
        />

        <button
          onClick={handleEvaluationUpdate}
          className="w-full mt-4 p-2 bg-primary text-white rounded flex items-center justify-center"
        >
          수정 완료
        </button>
      </div>
      <BottomBar />
    </>
  );
}
