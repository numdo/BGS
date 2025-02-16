// src/components/stat/WorkoutBalanceRadarChart.jsx
import React, { useEffect } from "react";
import { Radar } from "react-chartjs-2";
import { Card, CardContent, useTheme, Box } from "@mui/material";
import useStatsStore from "../../stores/useStatsStore";
import useUserStore from "../../stores/useUserStore";
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
  const { me } = useUserStore();
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

  // 만약 모든 값이 0이면, 운동을 시작하지 않은 것으로 판단
  const insufficientData = dataValues.every((value) => value === 0);

  const primaryDefault = fullConfig.theme.colors.primary.DEFAULT; // 예: "#5968eb"
  const primaryLight = fullConfig.theme.colors.primary.light; // 예: "#7985ef"

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
    <Card
      sx={{
        bgcolor: "white",
        border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: "0.5rem", // rounded-lg (약 8px)
        boxShadow:
          "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)", // shadow-md
        transition: "box-shadow 0.3s ease-in-out", // transition-shadow duration-300
        "&:hover": {
          boxShadow:
            "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)", // hover:shadow-lg
        },
      }}
    >
      {" "}
      <CardContent>
        <h3 className="text-xl font-bold mb-3 mt-4 text-center">
        {me.nickname ? `${me.nickname}의` : "나의"} <br /> 운동 밸런스 지표
        </h3>
        <Box sx={{ position: "relative" }}>
          <Radar data={chartData} options={options} />
          {insufficientData && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                bgcolor: "rgba(0, 0, 0, 0.3)", // 약간 어둡게
                backdropFilter: "blur(5px)", // blur 처리
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 5,
              }}
            >
              <h3 className="text-white p-2 text-center text-xl">
                <p>운동을 시작해서</p>
                <p>나의 운동 밸런스를 측정해보세요!</p>
              </h3>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
