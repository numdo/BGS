import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircleIcon, XMarkIcon, MicrophoneIcon } from "@heroicons/react/24/solid";
import { XCircleIcon } from "lucide-react";

export default function SttWorkoutGuide({ onCancel, toggleRecording, isRecording }) {
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
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <MicrophoneIcon className="w-6 h-6 mr-2" />
          STT 음성 가이드
        </h2>
        <p className="text-gray-600 mt-2">
          아래 예시처럼 말하면 운동 기록을 자동으로 정리해줘요!
        </p>

        {/* 예제 박스 */}
        <div className="bg-gray-100 p-4 mt-4 rounded-lg shadow-sm">
          <p className="text-gray-800 font-semibold mb-2">🎙 예제 입력:</p>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">
                "벤치프레스 첫세트 100kg 5번, 두번째세트 20kg 5번 했어"
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">"스쿼트 100kg 5회"</span>
            </div>
            <p className="text-gray-800 font-semibold mb-2">
              🎙 이렇게 하면 적용되지 않아요!
            </p>
            <div className="flex items-center space-x-2">
              <XCircleIcon className="w-5 h-5 text-red-500" />
              <span className="text-gray-700">"깐따비야 라라 동해물과"</span>
            </div>
          </div>
        </div>

        {/* 다시 보지 않기 체크박스 */}
        <label className="mt-4 flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="w-4 h-4 text-blue-500 focus:ring-blue-400"
          />
          <span className="ml-2 text-gray-600">다시 보지 않기</span>
        </label>

        {/* 버튼 영역 */}
        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
          >
            취소
          </button>
          <button
            onClick={toggleRecording}
            className="px-4 py-2 bg-primary text-white rounded-lg flex items-center space-x-2 transition"
          >
            <MicrophoneIcon className="w-5 h-5 text-white" />
            <span>{isRecording ? "녹음 중... (종료하려면 클릭)" : "녹음 시작"}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
