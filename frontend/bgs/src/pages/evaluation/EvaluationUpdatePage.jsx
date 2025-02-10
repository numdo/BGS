import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import BottomBar from "../../components/bar/BottomBar";
import TopBar from "../../components/bar/TopBar";
import addlogo from "../../assets/icons/add.svg";

export default function EvaluationUpdatePage() {
  const { evaluationId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [workoutType, setWorkoutType] = useState("BENCH");
  const [content, setContent] = useState("");
  const [weight, setWeight] = useState("");
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  // 기존 데이터 불러오기
  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const response = await axiosInstance.get(`/evaluations/${evaluationId}`);
        const data = response.data;

        setWorkoutType(data.workoutType);
        setContent(data.content);
        setWeight(data.weight.toFixed(1));
        setExistingImages(data.imageUrls || []);
      } catch (error) {
        console.error("❌ 데이터 불러오기 오류:", error);
        alert("🚨 평가 정보를 불러오지 못했습니다.");
        navigate("/workout");
      }
    };

    fetchEvaluation();
  }, [evaluationId, navigate]);

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

  // 새 이미지 추가
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const maxAllowedSize = 1 * 1024 * 1024;

    for (let file of selectedFiles) {
      if (file.size > maxAllowedSize) {
        alert(`파일이 너무 큽니다: ${file.name}`);
        return;
      }
    }
    if (selectedFiles.length + files.length + existingImages.length > 6) {
      alert("이미지는 최대 6장까지 업로드할 수 있습니다.");
      return;
    }

    setFiles((prev) => [...prev, ...selectedFiles]);
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  // 기존 이미지 삭제
  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 새 이미지 삭제
  const handleRemoveNewImage = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // 수정 요청
  const handleEvaluationUpdate = async (e) => {
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

    const updates = {
      workoutType,
      content,
      weight,
    };

    const formData = new FormData();
    formData.append("updates", new Blob([JSON.stringify(updates)], { type: "application/json" }));
    existingImages.forEach((url) => formData.append("existingImageUrls", url));
    files.forEach((file) => formData.append("newImages", file));

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
            <label className="font-bold mb-2">이미지 (최대 6장)</label>
            <div className="flex flex-wrap gap-2">
              {/* 기존 이미지 */}
              {existingImages.map((url, idx) => (
                <div key={`existing-${idx}`} className="relative w-40 h-40">
                  <img src={url} alt="preview" className="w-full h-full object-cover rounded-md shadow-md" />
                  <button onClick={() => handleRemoveExistingImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white text-sm px-1 rounded">
                    X
                  </button>
                </div>
              ))}
              {/* 새 이미지 */}
              {previewUrls.map((url, idx) => (
                <div key={`new-${idx}`} className="relative w-40 h-40">
                  <img src={url} alt="preview" className="w-full h-full object-cover rounded-md shadow-md" />
                  <button onClick={() => handleRemoveNewImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white text-sm px-1 rounded">
                    X
                  </button>
                </div>
              ))}
              {/* 추가 버튼 */}
              {existingImages.length + previewUrls.length < 6 && (
                <div className="w-40 h-40 bg-gray-200 rounded-md flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current.click()}>
                  <img src={addlogo} alt="" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 운동일지 내용 */}
        <textarea className="w-full h-24 mt-4 p-2 border rounded" value={content} onChange={(e) => setContent(e.target.value)} placeholder="운동일지 내용을 입력하세요." />

        {/* 저장 버튼 */}
        <button onClick={handleEvaluationUpdate} className="w-full mt-4 p-2 bg-primary text-white rounded">
          수정 완료
        </button>
      </div>
      <BottomBar />
    </>
  );
}
