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
  const [files, setFiles] = useState([]); // 여러 파일
  const [previewUrls, setPreviewUrls] = useState([]); // 미리보기 URL
  const fileInputRef = useRef(null);

  // 이미지 업로드
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const maxAllowedSize = 1 * 1024 * 1024;
    for (let file of selectedFiles) {
      if (file.size > maxAllowedSize) {
        alert(`파일이 너무 큽니다: ${file.name}`);
        return;
      }
    }
    if (selectedFiles.length + files.length > 6) {
      alert("이미지는 최대 6장까지 업로드할 수 있습니다.");
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

  // 숫자 및 소수점 1자리까지 입력 검증
  const handleWeightChange = (e) => {
    let value = e.target.value;

    // 숫자와 소수점만 입력 가능
    if (!/^\d*\.?\d*$/.test(value)) return;

    // 소수점 이하 1자리까지만 허용
    if (value.includes(".")) {
      const parts = value.split(".");
      if (parts[1].length > 1) return;
    }

    // 최대 999.9까지 입력 가능
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
  
    // weight 값이 없으면 요청 불가
    if (!weight) {
      alert("중량(kg)을 입력하세요.");
      return;
    }
  
    // 요청 데이터 생성
    const data = {
      workoutType,
      content,
      weight,
    };
  
    const formData = new FormData();
    formData.append(
      "data",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    );
    files.forEach((f) => formData.append("images", f));
  
    try {
      await axiosInstance.post("/evaluations", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      alert("✅ 평가 게시물 작성 완료!");
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
  

  return (
    <>
      <TopBar />
      <div className="m-5 pb-24 flex-col relative">
        {/* 운동 종류 선택 */}
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

        {/* 중량 입력 */}
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
                  <button
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white text-sm px-1 rounded"
                  >
                    X
                  </button>
                </div>
              ))}
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
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="운동일지 내용을 입력하세요."
        />

        {/* 저장 버튼 */}
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
