import React, { useState } from "react";
import { addWeightHistory } from "../../api/Stat";
import { showSuccessAlert, showErrorAlert } from "../../utils/toastrAlert"; // toastrAlert 함수들이 정의된 파일

export default function WeightRecordCard() {
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!weight || isNaN(weight)) {
      showErrorAlert("유효한 몸무게(kg)를 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      await addWeightHistory({ weight: parseFloat(weight) });
      showSuccessAlert("몸무게 기록이 추가되었습니다.");
      setWeight(""); // 입력창 초기화
    } catch (error) {
      showErrorAlert("몸무게 기록 추가에 실패했습니다.");
    } finally {
      setLoading(false);
      window.location.reload();
    }
  };

  // 엔터 키 입력 감지하여 handleSubmit 실행
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="p-4 bg-white border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-xl font-bold mb-3">
        몸무게를 기록해서 변화를 살펴봐요!
      </h3>
      <div className="flex items-center w-full">
        <input
          type="number"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="몸무게를 입력하세요"
          className="flex-grow border border-gray-300 rounded-l px-3 py-2 focus:outline-none"
        />
        <span className="px-2 text-gray-700">kg</span>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white font-semibold rounded-r hover:bg-primary-light transition-colors whitespace-nowrap"
        >
          {loading ? "저장 중..." : "기록하기"}
        </button>
      </div>
    </div>
  );
}
