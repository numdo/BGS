import React, { useEffect } from "react";

export default function AlertModal({
  message,
  onClose,
  success = false,
  buttonText = "확인",
  buttonColor = "bg-gray-200", // ✅ 기본값: 회색
  textColor = "text-gray-700", // ✅ 기본값: 어두운 회색
}) {
  // ✅ Esc 키를 눌렀을 때 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose && onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={onClose} // ✅ 모달 바깥 클릭 시 닫기
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full"
        onClick={(e) => e.stopPropagation()} // ❌ 내부 클릭은 이벤트 막기
      >
        <p
          className={`text-lg ${
            success ? "text-green-600" : "text-gray-800"
          } mb-4`}
        >
          {message}
        </p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 ${buttonColor} ${textColor} rounded hover:opacity-80 transition`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
