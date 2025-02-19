// src/components/stat/PredictedOneRMCard.jsx
import React, { useState, useEffect } from "react";
import { getOrm } from "../../api/Stat"; // API 모듈에서 getOrm 함수 import
import { showErrorAlert } from "../../utils/toastrAlert"; // 필요시 toastrAlert 사용

export default function PredictedOneRMCard() {
  const [orm, setOrm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState("bench");

  useEffect(() => {
    const fetchOrm = async () => {
      setLoading(true);
      try {
        const data = await getOrm();
        setOrm(data);
      } catch (error) {
        console.error("예상 1RM 데이터 가져오기 실패:", error);
        showErrorAlert("예상 1RM 데이터를 가져오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrm();
  }, []);

  const tabs = [
    { key: "bench", label: "벤치프레스" },
    { key: "dead", label: "데드리프트" },
    { key: "squat", label: "스쿼트" },
  ];

  const renderResult = () => {
    if (loading) return <p>불러오는 중...</p>;
    if (!orm) return <p>데이터가 없습니다.</p>;

    switch (selectedExercise) {
      case "bench":
        return (
          <p className="text-lg">
            <span className="font-bold text-primary">벤치프레스</span> 예상 1RM:{" "}
            <span className="font-bold text-xl text-secondary">{orm.bench} kg</span>
          </p>
        );
      case "dead":
        return (
          <p className="text-lg">
            <span className="font-bold text-primary">데드리프트</span> 예상 1RM:{" "}
            <span className="font-bold text-xl text-secondary">{orm.dead} kg</span>
          </p>
        );
      case "squat":
        return (
          <p className="text-lg">
            <span className="font-bold text-primary">스쿼트</span> 예상 1RM:{" "}
            <span className="font-bold text-xl text-secondary">{orm.squat} kg</span>
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 bg-white border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-xl font-bold mb-3 text-center">예상 1RM을 확인해보세요!</h3>

      {/* Active Tab UI - 탭 버튼이 가로로 꽉 차게 */}
      <div className="flex border-b mb-4">
        {tabs.map((tab) => (
          <div
            key={tab.key}
            onClick={() => setSelectedExercise(tab.key)}
            className={`flex-1 text-center cursor-pointer px-4 py-2
              ${
                selectedExercise === tab.key
                  ? "border-b-2 border-primary text-primary font-bold"
                  : "text-gray-600 hover:text-primary"
              }`}
          >
            {tab.label}
          </div>
        ))}
      </div>

      <div className="text-center">{renderResult()}</div>
    </div>
  );
}
