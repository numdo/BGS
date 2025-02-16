// src/components/stat/WorkoutBalanceRadarChart.jsx
import React, { useEffect } from "react";
import { Radar } from "react-chartjs-2";
import { Card, CardContent, Typography, useTheme } from "@mui/material";
import useStatsStore from "../../stores/useStatsStore";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

// Radar 차트에 필요한 컴포넌트 등록
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);
// tailwind 설정을 가져오기 위한 resolveConfig
import resolveConfig from "tailwindcss/resolveConfig";
// tailwind 설정 파일 import (경로는 실제 위치에 맞게 조정)
import tailwindConfig from "../../../tailwind.config.js";

const fullConfig = resolveConfig(tailwindConfig);

export default function WorkoutBalanceRadarChart() {
  const theme = useTheme();
  const { workoutBalance, fetchWorkoutBalance } = useStatsStore();

  useEffect(() => {
    // 데이터가 없더라도 fetch를 시도
    fetchWorkoutBalance();
  }, [fetchWorkoutBalance]);

  // 데이터가 없으면 기본 0값을 사용하여 빈 차트로 렌더링
  const dataValues = workoutBalance
    ? [
        workoutBalance.chest,
        workoutBalance.lat,
        workoutBalance.triceps,
        workoutBalance.shoulder,
        workoutBalance.biceps,
        workoutBalance.leg,
      ]
    : [0, 0, 0, 0, 0, 0];

  const primaryDefault = fullConfig.theme.colors.primary.DEFAULT; // "#5968eb"
  const primaryLight = fullConfig.theme.colors.primary.light; // "#7985ef"

  const labels = ["가슴", "등", "삼두", "하체", "이두", "어깨"];
  const chartData = {
    labels,
    datasets: [
      {
        label: "Workout Balance (%)",
        data: dataValues,
        backgroundColor: "rgba(121, 133, 239, 0.2)",
        borderColor: primaryDefault,
        pointBackgroundColor: primaryDefault,
        pointBorderColor: primaryLight,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    scales: {
      r: {
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
        },
        pointLabels: {
          font: {
            size: 14,
          },
        },
      },
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        font: {
          family: theme.typography.fontFamily,
          size: 18,
          weight: "bold",
        },
        padding: { bottom: 10 },
      },
    },
  };

  return (
    <Card sx={{ mt: 4 }}>
      <CardContent>
        <h3 className="text-xl font-bold mb-3 mt-4 text-center">
          나의 운동 밸런스
        </h3>
        <Radar data={chartData} options={options} />
      </CardContent>
    </Card>
  );
}
