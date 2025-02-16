// src/components/WeightHistoryChart.jsx
import React, { useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import { Card, CardContent, useTheme, Box } from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import useWeightHistoryStore from "../../stores/useWeightHistoryStore";
import useUserStore from "../../stores/useUserStore.jsx";

// ChartJS에 필요한 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
// tailwind 설정을 가져오기 위한 resolveConfig
import resolveConfig from "tailwindcss/resolveConfig";
// tailwind 설정 파일 import (경로는 실제 위치에 맞게 조정)
import tailwindConfig from "../../../tailwind.config.js";
const fullConfig = resolveConfig(tailwindConfig);

const LABEL_WIDTH = 80;
const MIN_SLOTS = 5;

export default function WeightHistoryChart() {
  const theme = useTheme();
  const containerRef = useRef(null);

  const { histories, loading, error, fetchHistories } = useWeightHistoryStore();
  const { me } = useUserStore();
  useEffect(() => {
    fetchHistories();
  }, [fetchHistories]);

  // 날짜 오름차순 정렬 (과거 → 현재)
  const sortedHistories = histories
    .slice()
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // 원래의 x축 라벨: 월/일만 표시
  const originalLabels = sortedHistories.map((item) => {
    const date = new Date(item.createdAt);
    return date.toLocaleDateString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
    });
  });
  const originalDataPoints = sortedHistories.map((item) => item.weight);
  const primaryDefault = fullConfig.theme.colors.primary.DEFAULT; // 예: "#5968eb"
  const primaryLight = fullConfig.theme.colors.primary.light; // 예: "#7985ef"
  // 빈 슬롯은 오른쪽 정렬 효과를 위해서만 사용 (5개 이상일 때만 적용)
  const emptySlots =
    originalDataPoints.length >= MIN_SLOTS
      ? Math.max(MIN_SLOTS - originalDataPoints.length, 0)
      : 0;
  const labels =
    emptySlots > 0
      ? new Array(emptySlots).fill("").concat(originalLabels)
      : originalLabels;
  const dataPoints =
    emptySlots > 0
      ? new Array(emptySlots).fill(null).concat(originalDataPoints)
      : originalDataPoints;

  // 5개 이상의 데이터가 있으면 canvasWidth는 슬롯 너비로 계산하고, 아니면 100%로 처리
  const canvasWidth =
    originalDataPoints.length >= MIN_SLOTS
      ? Math.max(labels.length, MIN_SLOTS) * LABEL_WIDTH
      : "100%";

  const data = {
    labels,
    datasets: [
      {
        label: "몸무게(kg)",
        data: dataPoints,
        borderColor: primaryLight,
        backgroundColor: "rgba(33, 150, 243, 0.1)",
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: primaryDefault,
        pointBorderColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: theme.palette.secondary.main,
      },
    ],
  };

  const minWeight = Math.min(...originalDataPoints, Infinity) - 1;
  const maxWeight = Math.max(...originalDataPoints, -Infinity) + 1;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      // Chart 제목에 MUI 폰트 적용 (차트 내부 제목은 제거)
      title: {
        display: true,
        font: {
          family: theme.typography.fontFamily,
          size: 18,
          weight: "bold",
        },
        padding: { bottom: 20 },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: { size: 14, weight: "bold" },
        bodyFont: { size: 12 },
        padding: 10,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          font: { size: 14, weight: "bold" },
        },
        grid: { display: false },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
        },
      },
      y: {
        position: "right",
        title: {
          display: true,
          font: { size: 14, weight: "bold" },
        },
        suggestedMin: minWeight,
        suggestedMax: maxWeight,
        ticks: { stepSize: 0.5 },
        grid: { color: "rgba(0, 0, 0, 0.05)" },
      },
    },
  };

  // 스크롤을 오른쪽 끝으로 이동 (가로 스크롤 있을 경우)
  useEffect(() => {
    if (containerRef.current && typeof canvasWidth === "number") {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [labels, canvasWidth]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (!originalDataPoints.length) return <div>데이터가 없습니다.</div>;

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
      {/* 제목 */}
      <h3 className="text-xl font-bold mb-3 mt-4 text-center">
        {me.nickname ? `${me.nickname}의` : "나의"} <br /> 몸무게 변화량
      </h3>
      <CardContent>
        <Box
          ref={containerRef}
          sx={{
            overflowX:
              originalDataPoints.length >= MIN_SLOTS ? "auto" : "visible",
            width: "100%",
            height: 300,
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: 2,
            p: 1,
          }}
        >
          <Box sx={{ width: canvasWidth, height: "100%" }}>
            <Line data={data} options={options} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
