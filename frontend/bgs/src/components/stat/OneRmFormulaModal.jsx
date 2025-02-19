import React from "react";

/**
 * 1RM 계산 공식을 안내하는 모달
 * @param {Function} onClose - 모달 닫기 함수
 */
export default function OneRmFormulaModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full relative">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M10 8.586l4.293-4.293a1 1 0 011.414 
            1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 
            1.414L10 11.414l-4.293 4.293a1 1 0 
            01-1.414-1.414L8.586 10 4.293 5.707a1 1 
            0 011.414-1.414L10 8.586z"
            />
          </svg>
        </button>

        {/* 모달 제목 */}
        <h2 className="text-2xl font-bold text-gray-800 mb-3">1RM 계산 공식</h2>

        <p className="text-gray-700 whitespace-normal break-keep">
          기록된 운동 중 가장 퍼포먼스가 뛰어난 운동을 바탕으로 계산한 수치입니다.
        </p>

        {/* 공식 영역 */}
        <div className="bg-gray-100 p-4 mt-4 rounded-lg shadow-sm">
          <p className="text-gray-800 font-semibold text-center">
            1RM = 무게 × (1 + 횟수 / 30)
          </p>
          <p className="text-sm text-gray-600 mt-2 text-center">
            예) 50kg × 8회 → 1RM ≈ 50 × (1 + 8 / 30) = 63.3kg
          </p>
        </div>

        {/* 확인 버튼 */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
