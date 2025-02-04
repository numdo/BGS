// src/components/mygym/MyGymItem.jsx
import { useState } from "react";
import useMyGymStore from "../../stores/useMyGymStore";

// 예시 이미지 import
import BenchPress from "../../assets/benchpress.png";
import LatPulldown from "../../assets/Latpulldown.png";
import Deadlift from "../../assets/deadlift.png";
import cycle from "../../assets/cycle.png";
import runningmachine from "../../assets/runningmachine.png";
import pullup from "../../assets/pullup.png";
import dumbbell from "../../assets/dumbbell.png";
import men from "../../assets/men.png";
import women from "../../assets/women.png";

const MyGymItem = () => {
  const { items, setItems } = useMyGymStore(); // Zustand store
  const [isOpen, setIsOpen] = useState(false);

  // 아이템 목록
  const gymItems = [
    { name: "여자", image: women },
    { name: "남자", image: men },
    { name: "벤치프레스", image: BenchPress },
    { name: "랫풀다운", image: LatPulldown },
    { name: "데드리프트", image: Deadlift },
    { name: "사이클", image: cycle },
    { name: "런닝머신", image: runningmachine },
    { name: "덤벨", image: dumbbell },
    { name: "풀업", image: pullup },
  ];

  // 아이템 추가
  const addItem = (item) => {
    console.log(`${item.name} 추가`);

    // 현재 store 상태(배열)에서 중복 검사
    if (items.some((prevItem) => prevItem.name === item.name)) {
      alert(`이미 '${item.name}'가(이) 배치되었습니다!`);
      return;
    }

    // 새 배열
    const newArr = [
      ...items,
      {
        id: Date.now(),
        ...item,
        x: 160, // 방 중앙
        y: 160,
      },
    ];
    setItems(newArr);

    // 아이템 선택 후 목록 닫기
    setIsOpen(false);
  };

  // 목록 열기/닫기
  const toggleBox = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`fixed bottom-12 left-0 w-full bg-sky-100 rounded-t-3xl shadow-lg transition-transform duration-500 ${
        isOpen ? "translate-y-0" : "translate-y-[70%]"
      }`}
    >
      {/* 닫기/열기 버튼 */}
      <button
        onClick={toggleBox}
        className="w-full py-3 bg-sky-100 text-gray-800 font-bold rounded-t-3xl"
      >
        ㅡ
      </button>

      {/* 아이템 목록 (가로 스크롤) */}
      <div className="p-4 overflow-x-auto scroll-snap-x-mandatory flex space-x-4">
        {/* 3개씩 묶어 그리드 */}
        {gymItems
          .reduce((result, item, index) => {
            const groupIndex = Math.floor(index / 3);
            if (!result[groupIndex]) result[groupIndex] = [];
            result[groupIndex].push(item);
            return result;
          }, [])
          .map((group, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full max-w-[calc(100%-1rem)] grid grid-cols-3 gap-4"
            >
              {group.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => addItem(item)}
                  className="flex flex-col items-center cursor-pointer"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-contain mb-2"
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default MyGymItem;
