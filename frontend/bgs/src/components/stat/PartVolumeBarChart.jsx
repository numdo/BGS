// src/components/PartVolumeBarChart.jsx
import React, { useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Card, CardContent, Box } from "@mui/material";
import useStatsStore from "../../stores/useStatsStore";
import useUserStore from "../../stores/useUserStore";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Chart.js에 필요한 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Tailwind 설정값을 resolveConfig로 가져오기
import resolveConfig from "tailwindcss/resolveConfig";
// tailwind.config.js의 경로를 실제 프로젝트 경로에 맞게 조정하세요.
import tailwindConfig from "../../../tailwind.config.js";

// 전체 Tailwind 설정 객체로 변환
const fullConfig = resolveConfig(tailwindConfig);

// Tailwind에서 정의한 색상 추출
const primaryDefault = fullConfig.theme.colors.primary.DEFAULT; // 예: "#5968eb"
const primaryLight = fullConfig.theme.colors.primary.light; // 예: "#7985ef"
const danger = fullConfig.theme.colors.danger; // 예: "#77240B"

// 헥스 코드를 rgba 문자열로 변환하는 헬퍼 함수
function hexToRgba(hex, alpha) {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/*
  이번주: primary.DEFAULT, 강조 수준 높게 (alpha 0.9)
  저번주: primary.light, 중간 강조 (alpha 0.7)
  2주전: danger, 가장 낮은 강조 (alpha 0.5)
*/
const thisWeekColor = hexToRgba(primaryDefault, 0.9);
const lastWeekColor = hexToRgba(primaryLight, 0.7);
const twoWeekColor = hexToRgba(danger, 0.5);

export default function PartVolumeBarChart() {
  const { partVolume, fetchPartVolume } = useStatsStore();
  const { me } = useUserStore();

  useEffect(() => {
    fetchPartVolume();
  }, [fetchPartVolume]);

  // 데이터가 없으면 기본 빈 객체 사용
  const thisWeek = partVolume?.thisWeek || {
    chest: 0,
    lat: 0,
    shoulder: 0,
    leg: 0,
  };
  const lastWeek = partVolume?.lastWeek || {
    chest: 0,
    lat: 0,
    shoulder: 0,
    leg: 0,
  };
  const twoWeeksAgo = partVolume?.twoWeeksAgo || {
    chest: 0,
    lat: 0,
    shoulder: 0,
    leg: 0,
  };

  // 모든 주의 모든 값이 0이면 데이터가 부족한 것으로 간주
  const insufficientData = [thisWeek, lastWeek, twoWeeksAgo].every((week) => {
    return (
      week.chest === 0 &&
      week.lat === 0 &&
      week.shoulder === 0 &&
      week.leg === 0
    );
  });

  const labels = ["가슴", "등", "어깨", "하체"];
  const chartData = {
    labels,
    datasets: [
      {
        label: "이번주",
        data: [thisWeek.chest, thisWeek.lat, thisWeek.shoulder, thisWeek.leg],
        backgroundColor: thisWeekColor,
      },
      {
        label: "저번주",
        data: [lastWeek.chest, lastWeek.lat, lastWeek.shoulder, lastWeek.leg],
        backgroundColor: lastWeekColor,
      },
      {
        label: "2주전",
        data: [
          twoWeeksAgo.chest,
          twoWeeksAgo.lat,
          twoWeeksAgo.shoulder,
          twoWeeksAgo.leg,
        ],
        backgroundColor: twoWeekColor,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        font: { size: 18, weight: "bold" },
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
      <CardContent>
        <h3 className="text-xl font-bold mb-3 mt-4 text-center">
          {me.nickname ? `${me.nickname}의` : "나의"} <br /> 부위별 운동량
        </h3>
        <Box sx={{ position: "relative" }}>
          <Bar data={chartData} options={options} />
          {insufficientData && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                bgcolor: "rgba(0, 0, 0, 0.3)",
                backdropFilter: "blur(5px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 5,
              }}
            >
              <h3 className="text-white p-2 text-center text-lg">
                <p>운동을 시작해서</p>
                <p>나의 부위별 운동량을 측정해보세요!</p>{" "}
              </h3>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
