import React, { useEffect } from "react";

export default function ConfirmModal({
  message = "확인하시겠습니까?",
  confirmText = "확인",
  cancelText = "취소",
  confirmColor = "bg-primary", // ✅ 기본값: 파란색
  cancelColor = "bg-gray-200", // ✅ 기본값: 회색
  textColor = "text-white", // ✅ 기본값: 흰색 텍스트
  onConfirm,
  onCancel,
}) {
  // ✅ Esc 키를 눌렀을 때 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCancel && onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={onCancel} // ✅ 모달 바깥 클릭 시 닫기
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full"
        onClick={(e) => e.stopPropagation()} // ❌ 내부 클릭은 이벤트 막기
      >
        <p className="text-lg text-gray-800 mb-4">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className={`px-4 py-2 ${cancelColor} text-gray-700 rounded hover:bg-gray-300 transition`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 ${confirmColor} ${textColor} rounded hover:opacity-80 transition`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
