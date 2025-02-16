// src/components/myinfo/StatsTab.jsx
import React from "react";
import WeightHistoryChart from "../stat/WeightHistoryChart"; // 몸무게 변화 차트
import PartVolumeBarChart from "../stat/PartVolumeBarChart"; // 부위별 운동량 차트
import WorkoutBalanceRadarChart from "../stat/WorkoutBalanceRadarChart"; // 운동 밸런스 차트

export default function StatsTab() {
  return (
    <div className="mt-8">
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
    </div>
  );
}
