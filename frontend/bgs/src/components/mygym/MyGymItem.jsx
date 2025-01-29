import { useState } from "react";

// 이미지 import
import BenchPress from "../../assets/benchpress.png";
import LatPulldown from "../../assets/Latpulldown.png";
import Deadlift from "../../assets/deadlift.png";
import cycle from "../../assets/cycle.png";
import runningmachine from "../../assets/Runningmachine.png";
import pullup from "../../assets/pullup.png";
import dumbbell from "../../assets/dumbbell.png";
import men from "../../assets/men.png";
import women from "../../assets/women.png";

const MyGymItem = ({setItems}) => {
  const [isOpen, setIsOpen] = useState(false);
  const addItem = (item) => {
    console.log(`${item.name} 추가`);
  
    setItems((prevItems) => {
      //  중복 여부 확인
      const isDuplicate = prevItems.some((prevItem) => prevItem.name === item.name);
  
      if (isDuplicate) {
        // 중복이면 알림만 띄우고 그 상태 그대로 반환
        alert(`이미 '${item.name}'가(이) 배치되었습니다!`);
        return prevItems;
      }
  
      //  중복이 아니면 새 아이템 추가
      return [
        ...prevItems,
        {
          id: Date.now(),
          ...item,
          x: 160, // 방 중앙값
          y: 160,
        },
      ];
    });
  };
  

  const toggleBox = () => {
    setIsOpen(!isOpen); // 열림/닫힘 상태 변경
  };

  // 아이템 데이터 배열
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

  return (
    <>
      {/* 네모 박스 */}
      <div
        className={`fixed bottom-12 left-0 w-full bg-sky-100 rounded-t-3xl shadow-lg transition-transform duration-500 ${
          isOpen ? "translate-y-0" : "translate-y-[70%]"
        }`}
      >
        {/* 열기/닫기 버튼 */}
        <button
          onClick={toggleBox}
          className="w-full py-3 bg-sky-100 text-gray-800 font-bold rounded-t-3xl"
        >
          ㅡ
        </button>

        {/* 스크롤 가능한 아이템들 */}
        <div className="p-4 overflow-x-auto scroll-snap-x-mandatory flex space-x-4">
          {/* 슬라이드 하나 */}
          {gymItems.reduce((result, item, index) => {
            const groupIndex = Math.floor(index / 3); // 3개씩 묶기
            if (!result[groupIndex]) result[groupIndex] = []; // 새로운 그룹 생성
            result[groupIndex].push(item);
            return result;
          }, []).map((group, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full max-w-[calc(100%-1rem)] grid grid-cols-3 gap-4"
            >
              {group.map((item, idx) => (
                <div key={idx} onClick={() => addItem(item)} className="flex flex-col items-center">
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
    </>
  );
};

export default MyGymItem;
