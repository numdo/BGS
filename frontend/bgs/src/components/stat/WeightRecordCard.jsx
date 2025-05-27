import React, { useState } from "react";
import { addWeightHistory } from "../../api/Stat";
import { showSuccessAlert, showErrorAlert } from "../../utils/toastrAlert"; // toastrAlert 함수들
import ConfirmModal from "../common/ConfirmModal"; // ConfirmModal 컴포넌트 import (경로에 맞게 조정)

export default function WeightRecordCard() {
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleActualSubmit = async () => {
    setConfirmOpen(false);
    setLoading(true);
    try {
      await addWeightHistory({ weight: parseFloat(weight) });
      showSuccessAlert("몸무게 기록이 추가되었습니다.");
      setWeight(""); // 입력창 초기화
    } catch (error) {
      showErrorAlert("몸무게 기록 추가에 실패했습니다.");
    } finally {
      setLoading(false);
      window.location.reload(); // 필요에 따라 새로고침 여부 결정
    }
  };

  const handleSubmit = async () => {
    const weightNum = parseFloat(weight);
    if (!weight || isNaN(weightNum)) {
      showErrorAlert("유효한 몸무게(kg)를 입력해주세요.");
      return;
    }
    // 10kg 이상 1000kg 이하만 허용 (음수 및 그 외 범위 불허)
    if (weightNum < 10 || weightNum > 1000) {
      showErrorAlert("몸무게는 10kg 이상 1000kg 이하로 입력해주세요.");
      return;
    }
    // ConfirmModal을 열어서 사용자가 입력한 값 확인
    setConfirmOpen(true);
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
          min="10"
          max="1000"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="몸무게를 입력하세요"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
        />
        <span className="px-2 text-gray-700">kg</span>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white font-semibold rounded hover:bg-primary-light transition-colors whitespace-nowrap"
        >
          {loading ? "저장 중..." : "기록하기"}
        </button>
      </div>

      {/* ConfirmModal: 사용자가 입력한 몸무게 확인 */}
      {confirmOpen && (
        <ConfirmModal
          message={`입력하신 몸무게 ${weight}kg가 맞습니까?`}
          confirmText="확인"
          cancelText="취소"
          confirmColor="bg-primary"
          cancelColor="bg-gray-200"
          textColor="text-white"
          onConfirm={handleActualSubmit}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}
