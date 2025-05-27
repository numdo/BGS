// src/components/myinfo/StatsTab.jsx
import React from "react";
import WeightHistoryChart from "../stat/WeightHistoryChart"; // 몸무게 변화 차트
import PartVolumeBarChart from "../stat/PartVolumeBarChart"; // 부위별 운동량 차트
import WorkoutBalanceRadarChart from "../stat/WorkoutBalanceRadarChart"; // 운동 밸런스 차트
import WorkoutRecordChart from "../stat/WorkoutRecordChart"; // 운동 기록 차트
import WeightRecordCard from "../stat/WeightRecordCard"; // 몸무게 기록 카드
import PredictedOneRMCard from "../stat/PredictedOneRMCard"; // 예상 1RM 카드
import ComprehensiveAdviceCard from "../stat/ComprehensiveAdviceCard"; // 종합 조언 카드

export default function StatsTab() {
  return (
    <div className="mx-2">
      <div className="mt-2 mb-4">
        <WeightRecordCard />
      </div>
      <PredictedOneRMCard />
      <div className="mt-4 mb-4">
        <ComprehensiveAdviceCard />
      </div>
      {/* 레이더 차트 */}
      <div className="mt-4 mb-4">
        <WeightHistoryChart />
      </div>
      <div className="mt-4 mb-4">
        <WorkoutBalanceRadarChart />
      </div>
      <div className="mt-4 mb-4">
        <PartVolumeBarChart />
      </div>
      <div className="mt-4 mb-4">
        <WorkoutRecordChart />
      </div>
    </div>
  );
}
