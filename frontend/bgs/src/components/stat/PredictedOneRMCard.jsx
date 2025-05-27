// src/components/stat/PredictedOneRMCard.jsx
import React, { useState, useEffect } from "react";
import { getOrm } from "../../api/Stat"; // API 호출
import { showErrorAlert } from "../../utils/toastrAlert"; // 필요 시
import { InformationCircleIcon } from "@heroicons/react/24/outline"; // 정보 아이콘 (Heroicons)
import OneRmFormulaModal from "./OneRmFormulaModal"; // 모달 컴포넌트 import

export default function PredictedOneRMCard() {
  const [orm, setOrm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState("bench");
  const [openModal, setOpenModal] = useState(false); // 모달 열림/닫힘 상태

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
    <>
      {/* 모달 표시 */}
      {openModal && <OneRmFormulaModal onClose={() => setOpenModal(false)} />}

      <div className="p-4 bg-white border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
        {/* 제목 + 정보 아이콘 */}
        <div className="flex items-center justify-center mb-3">
          <h3 className="text-xl font-bold text-center mr-2">
            예상 1RM을 확인해보세요!
          </h3>
          {/* 아이콘 클릭 시 모달 열림 */}
          <InformationCircleIcon
            className="w-5 h-5 text-gray-500 cursor-pointer"
            onClick={() => setOpenModal(true)}
          />
        </div>

        {/* 탭 UI */}
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
    </>
  );
}
