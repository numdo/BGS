import React from "react";

export default function SaveConfirmAlert({ 
  message = "성공했습니다", 
  onConfirm 
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <p className="text-lg text-gray-800 mb-4">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
