// src/components/stat/WorkoutRecordChart.jsx
import React, { useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import useWorkoutReocordStore from "../../stores/useWorkoutRecordStore";
import BeatLoader from "../common/LoadingSpinner";
import { Card, CardContent, Typography, Box, useTheme } from "@mui/material";
import useUserStore from "../../stores/useUserStore";
import PredictedOneRMCard from "./PredictedOneRMCard";
// tailwind 설정을 가져오기 위한 resolveConfig
import resolveConfig from "tailwindcss/resolveConfig";
// tailwind 설정 파일 import (경로는 실제 위치에 맞게 조정)
import tailwindConfig from "../../../tailwind.config.js";
const fullConfig = resolveConfig(tailwindConfig);

// ChartJS 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const WorkoutRecordChart = () => {
  const theme = useTheme();
  const { workoutRecord, loading, fetchWorkoutRecord } =
    useWorkoutReocordStore();
  const { me } = useUserStore();

  useEffect(() => {
    fetchWorkoutRecord();
  }, [fetchWorkoutRecord]);

  if (loading) {
    return (
      <Box className="flex justify-center items-center p-8">
        <BeatLoader color="#2563eb" size={15} margin={2} />
      </Box>
    );
  }

  if (!workoutRecord) {
    return (
      <Typography variant="body1" className="text-center p-4">
        운동 기록이 없습니다.
      </Typography>
    );
  }

  const primaryDefault = fullConfig.theme.colors.primary.DEFAULT; // 예: "#5968eb"
  const primaryLight = fullConfig.theme.colors.primary.light; // 예: "#7985ef"
  const secondaryDefault = "#8D78F2"; // 예: "#6B5D3F"

  const total = workoutRecord.bench + workoutRecord.dead + workoutRecord.squat;

  const chartData = {
    labels: ["벤치프레스", "데드리프트", "스쿼트"],
    datasets: [
      {
        label: "운동 기록 (kg)",
        data: [workoutRecord.bench, workoutRecord.dead, workoutRecord.squat],
        // 각 막대마다 다른 색상 적용
        backgroundColor: [primaryDefault, secondaryDefault, primaryLight],
        borderColor: [primaryDefault, secondaryDefault, primaryLight],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `3대 운동 총합: ${total}kg`,
        font: {
          family: '"42dot Sans", serif',
          size: 18,
          weight: "bold",
        },
      },
    },
  };

  return (
    <Card
      sx={{
        bgcolor: "white",
        border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: "0.5rem",
        boxShadow:
          "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.3s ease-in-out",
        "&:hover": {
          boxShadow:
            "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
        },
        maxWidth: "100%",
      }}
      className="my-4 mx-auto"
    >
      <CardContent>
        <h3 className="text-xl font-bold mb-3 mt-4 text-center">
          {me.nickname ? `${me.nickname}의` : "나의"} <br /> 3대 운동 기록
        </h3>
        <Box sx={{ position: "relative" }}>
          <Bar data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default WorkoutRecordChart;
