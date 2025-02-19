// src/components/stat/ComprehensiveAdviceCard.jsx
import React, { useEffect, useState } from "react";
import { getComprehensiveAdvice } from "../../api/Stat"; // 백엔드 GPT 종합 조언 API
import useStatsStore from "../../stores/useStatsStore";
import useWorkoutRecordStore from "../../stores/useWorkoutRecordStore";
import useWeightHistoryStore from "../../stores/useWeightHistoryStore";
import BeatLoader from "../common/LoadingSpinner";
import ComprehensiveAdviceModal from "./ComprehensiveAdviceModal";

export default function ComprehensiveAdviceCard() {
  // 여러 스토어 상태 및 로딩
  const {
    workoutBalance,
    loading: balanceLoading,
    fetchWorkoutBalance,
  } = useStatsStore();

  const {
    workoutRecord,
    loading: recordLoading,
    fetchWorkoutRecord,
  } = useWorkoutRecordStore();

  const {
    histories,
    loading: weightLoading,
    fetchHistories,
  } = useWeightHistoryStore();

  // 모달/조언 관련 상태
  const [advice, setAdvice] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [fetching, setFetching] = useState(false); // GPT API 호출 중 여부

  useEffect(() => {
    // 컴포넌트 마운트 시 필요한 데이터 로딩
    fetchWorkoutBalance();
    fetchWorkoutRecord();
    fetchHistories();
  }, [fetchWorkoutBalance, fetchWorkoutRecord, fetchHistories]);

  // 데이터가 충분한지 여부 판단
  const isDataSufficient = () => {
    if (!workoutBalance) return false;
    if (!workoutRecord) return false;
    if (!histories || histories.length === 0) return false;
    // 필요하다면 3대 운동 전부 0이 아님, 밸런스가 전부 0이 아님 등 세부조건 추가
    return true;
  };

  const handleGetAdvice = async () => {
    // 이미 호출 중이거나 데이터 부족이면 중단
    if (fetching || !isDataSufficient()) {
      alert("데이터가 부족하여 조언을 받을 수 없습니다!");
      return;
    }
    setFetching(true);
    try {
      const result = await getComprehensiveAdvice();
      setAdvice(result);
      setOpenModal(true);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 400) {
        alert(err.response.data || "아직 데이터가 부족해 조언을 받을 수 없습니다.");
      } else {
        alert("조언 조회에 실패하였습니다.");
      }
    } finally {
      setFetching(false);
    }
  };

  // 로딩 스피너 표시 여부
  const anyLoading = balanceLoading || recordLoading || weightLoading || fetching;

  return (
    <>
      {/* 모달 */}
      {openModal && (
        <ComprehensiveAdviceModal
          content={advice}
          onClose={() => setOpenModal(false)}
        />
      )}

      {/* 카드 */}
      <div className="p-4 bg-white border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 max-w-md mx-auto">
        {/* 제목 */}
        <h2 className="text-xl font-bold text-center mb-1">
          AI 트레이너한테 조언받기
        </h2>
        {/* 부제 */}
        <p className="text-sm text-gray-600 text-center mb-4">
          기록된 운동 데이터로 AI 트레이너한테 조언을 받아보세요!
        </p>

        {/* 버튼 / 로딩 */}
        {anyLoading ? (
          <div className="flex justify-center items-center h-16">
            <BeatLoader color="#2563eb" size={10} margin={2} />
          </div>
        ) : (
          <button
            onClick={handleGetAdvice}
            disabled={!isDataSufficient()}
            className={
              isDataSufficient()
                ? "w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary-light transition"
                : "w-full px-4 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed"
            }
          >
            조언 받기
          </button>
        )}
      </div>
    </>
  );
}
