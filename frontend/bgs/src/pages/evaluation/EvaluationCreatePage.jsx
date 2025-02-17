import { useState, useRef } from "react";
import axiosInstance from "../../utils/axiosInstance";
import BottomBar from "../../components/bar/BottomBar";
import TopBar from "../../components/bar/TopBar";
import addlogo from "../../assets/icons/add.svg";
import { useNavigate } from "react-router-dom";

export default function EvaluationCreatePage() {
  const navigate = useNavigate();

  const [workoutType, setWorkoutType] = useState("BENCH"); // BENCH, DEAD, SQUAT
  const [content, setContent] = useState("");
  const [weight, setWeight] = useState(""); // Decimal(4,1) 형식
  const [file, setFile] = useState(null); // 단일 파일
  const [previewUrl, setPreviewUrl] = useState(null); // 미리보기 URL
  const fileInputRef = useRef(null);

  // 파일 업로드 (영상만 허용, 1개 제한)
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

  // 숫자 및 소수점 1자리까지 입력 검증
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

  const handleEvaluationSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    if (!weight) {
      alert("중량(kg)을 입력하세요.");
      return;
    }

    const data = { workoutType, content, weight };

    const formData = new FormData();
    formData.append(
      "data",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    );
    if (file) {
      formData.append("images", file);
    }

    try {
      await axiosInstance.post("/evaluations", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      alert("✅ 평가 게시물 작성 완료!");
      navigate("/workout");
    } catch (error) {
      console.error("❌ 저장 오류:", error);
      if (error.response?.status === 401) {
        alert("로그인이 필요합니다.");
        navigate("/login");
      } else {
        alert("🚨 저장 실패!");
      }
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

        {/* 영상 업로드 (1개 제한) */}
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
              {previewUrl && (
                <div className="relative w-40 h-40">
                  <video
                    src={previewUrl}
                    className="w-full h-full object-cover rounded-md shadow-md"
                    controls
                  />
                  <button
                    onClick={handleRemoveFile}
                    className="absolute top-1 right-1 bg-red-600 text-white text-sm px-1 rounded"
                  >
                    X
                  </button>
                </div>
              )}
              {!previewUrl && (
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
          onClick={handleEvaluationSubmit}
          className="w-full mt-4 p-2 bg-primary text-white rounded"
        >
          저장
        </button>
      </div>
      <BottomBar />
    </>
  );
}
