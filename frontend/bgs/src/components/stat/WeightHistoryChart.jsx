// src/components/WeightHistoryChart.jsx
import React, { useEffect } from "react";
import { Line } from "react-chartjs-2";
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

// chartjs-plugin-zoom 플러그인
import zoomPlugin from "chartjs-plugin-zoom";

import { Card, CardContent, Box, useTheme } from "@mui/material";
import useWeightHistoryStore from "../../stores/useWeightHistoryStore";
import useUserStore from "../../stores/useUserStore";
import BeatLoader from "../common/LoadingSpinner";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../../tailwind.config.js";

// Tailwind 설정
const fullConfig = resolveConfig(tailwindConfig);

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

export default function WeightHistoryChart() {
  const theme = useTheme();
  const { histories, loading, error, fetchHistories } = useWeightHistoryStore();
  const { me } = useUserStore();

  useEffect(() => {
    fetchHistories();
  }, [fetchHistories]);

  if (loading) {
    return <BeatLoader color="#2563eb" size={15} margin={2} />;
  }
  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }
  if (!histories.length) {
    return <div>데이터가 없습니다.</div>;
  }

  // 히스토리 정렬 (과거→현재)
  const sorted = [...histories].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  // X축 라벨 (월/일)
  const labels = sorted.map((h) => {
    const d = new Date(h.createdAt);
    return d.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
  });
  // 몸무게 데이터
  const weights = sorted.map((h) => h.weight);

  const primaryDefault = fullConfig.theme.colors.primary.DEFAULT;
  const primaryLight = fullConfig.theme.colors.primary.light;

  // Chart.js에 넣을 데이터
  const data = {
    labels,
    datasets: [
      {
        label: "몸무게(kg)",
        data: weights,
        borderColor: primaryLight,
        backgroundColor: "rgba(121,133,239,0.1)",
        pointRadius: 4,
        pointBackgroundColor: primaryDefault,
        tension: 0.4,
      },
    ],
  };

  // 줌/팬 플러그인 옵션
  const zoomOptions = {
    pan: {
      enabled: true,
      mode: "x", // x축 드래그 이동
      modifierKey: null,
    },
    zoom: {
      wheel: { enabled: true }, // 마우스 휠 줌
      pinch: { enabled: true }, // 터치 핀치 줌
      mode: "x",                // x축 줌
    },
    limits: {
      // 축소(zoom out) 시 양 끝 반쯤 잘리는 문제를 완화
      x: { min: "original", max: "original" },
      y: { min: "original", max: "original" },
    },
  };

  // Chart.js 옵션
  const options = {
    responsive: true,
    maintainAspectRatio: false, // 높이를 부모에 맞춤
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        // 폰트 깨짐 방지용, 필요한 경우 family 변경
        font: {
          // family: theme.typography.fontFamily,
          size: 18,
          weight: "bold",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: { size: 14, weight: "bold" },
        bodyFont: { size: 12 },
        padding: 10,
      },
      zoom: zoomOptions,
    },
    scales: {
      y: {
        position: "right",
        grid: { display: true, color: "rgba(0, 0, 0, 0.1)" },
        ticks: {
          display: true, // Y축 값 표시
          color: "#666",
        },
        border: { display: false },
      },
      x: {
        offset: true,
        grid: { display: false },
        ticks: {
          autoSkip: true,
          maxRotation: 0,
          color: "#666",
        },
      },
    },
    layout: {
      // 왼/오른쪽 패딩 넉넉히 → 축소(zoom out) 시 점이 짤리지 않도록
      padding: {
        left: 25,
        right: 25,
      },
    },
  };

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        bgcolor: "white",
        border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: "0.5rem",
        height: "22rem",
        boxShadow:
          "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.3s ease-in-out",
        "&:hover": {
          boxShadow:
            "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
        },
      }}
    >
      {/* 상단 제목 영역 */}
      <h3 className="text-xl font-bold mt-6 text-center">
        {me.nickname ? `${me.nickname}의` : "나의"} <br /> 몸무게 변화량
      </h3>

      {/* 차트 영역: height를 크게 (약 2배) */}
      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ position: "relative", flex: 1 }}>
          {/* 차트가 height: 600px인 박스에 맞춰 렌더링 */}
          <Line data={data} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
}
