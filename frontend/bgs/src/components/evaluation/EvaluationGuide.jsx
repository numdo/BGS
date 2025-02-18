import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";
import cbumImage from "../../assets/images/cbum.jpg"; // 이미지 import

export default function EvaluationPostGuide({ onCancel }) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full relative"
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* 헤더 */}
        <h2 className="text-2xl font-bold text-gray-800">
          평가 게시물 영상 가이드
        </h2>
        <p className="text-gray-600 mt-2">
          아래 가이드를 참고하여, 영상을 업로드해주세요!
        </p>

        {/* 가이드 내용 영역 */}
        <div className="bg-gray-100 p-4 mt-4 rounded-lg shadow-sm">
          {/* 예시 이미지 */}
          <img
            src={cbumImage}  // import한 변수를 사용
            className="w-full rounded-md mb-4"
            alt="가이드 예시 이미지"
          />
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">전신이 다 보이게 해주세요.</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">원판이 잘 보이게 해주세요.</span>
            </div>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            확인
          </button>
        </div>
      </motion.div>
    </div>
  );
}
