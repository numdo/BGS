// src/components/WeightHistoryChart.jsx
import React, { useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import { Card, CardContent, CardHeader, useTheme, Box } from "@mui/material";
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

const LABEL_WIDTH = 80;
const VISIBLE_LABELS = 6;

export default function WeightHistoryChart() {
  const theme = useTheme();
  const containerRef = useRef(null);

  const { histories, loading, error, fetchHistories } = useWeightHistoryStore();

  useEffect(() => {
    fetchHistories();
  }, [fetchHistories]);

  // 날짜 오름차순 정렬 (과거 → 현재)
  const sortedHistories = histories
    .slice()
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // x축 라벨: 월/일만 표시
  const labels = sortedHistories.map((item) => {
    const date = new Date(item.createdAt);
    return date.toLocaleDateString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
    });
  });
  const dataPoints = sortedHistories.map((item) => item.weight);

  const canvasWidth = labels.length * LABEL_WIDTH;

  const data = {
    labels,
    datasets: [
      {
        label: "몸무게(kg)",
        data: dataPoints,
        borderColor: theme.palette.primary.main,
        backgroundColor: "rgba(33, 150, 243, 0.1)",
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: theme.palette.primary.main,
        pointBorderColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: theme.palette.secondary.main,
      },
    ],
  };

  const minWeight = Math.min(...dataPoints) - 1;
  const maxWeight = Math.max(...dataPoints) + 1;

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
          maxTicksLimit: VISIBLE_LABELS,
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

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [labels]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (!dataPoints.length) return <div>데이터가 없습니다.</div>;

  return (
    <Card sx={{ mt: 4 }}>
      {/* CardHeader를 사용하여 타이틀 영역 추가 */}
      <h3 className="text-xl font-bold mb-3 mt-4 text-center">
        몸무게 변화 추이
      </h3>
      <CardContent>
        <Box
          ref={containerRef}
          sx={{
            overflowX: "auto",
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
