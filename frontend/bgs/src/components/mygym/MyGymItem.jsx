import { useState } from "react";

// 이미지 import
import BenchPress from "../../assets/벤치프레스.png";
import LatPulldown from "../../assets/랩폴다운.png";
import Deadlift from "../../assets/데드리프트.png";
import Squat from "../../assets/스쿼트.png";
import PowerRack from "../../assets/파워랙.png";
import HipRack from "../../assets/히프랙.png";
import SquatRack from "../../assets/스쿼트랙.png";
import SmithMachine from "../../assets/스미스머신.png";
import LegPress from "../../assets/레그프레스.png";
import LegCurl from "../../assets/레그컬.png";

const MyGymItem = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleBox = () => {
    setIsOpen(!isOpen); // 열림/닫힘 상태 변경
  };

  // 아이템 데이터 배열
  const gymItems = [
    { name: "벤치프레스", image: BenchPress },
    { name: "랩폴다운", image: LatPulldown },
    { name: "데드리프트", image: Deadlift },
    { name: "스쿼트", image: Squat },
    { name: "파워랙", image: PowerRack },
    { name: "히프랙", image: HipRack },
    { name: "스쿼트랙", image: SquatRack },
    { name: "스미스머신", image: SmithMachine },
    { name: "레그프레스", image: LegPress },
    { name: "레그컬", image: LegCurl },
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
          className="w-full py-3 bg-sky-100 text-gray-800 font-bold rounded-t-10xl"
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
                <div key={idx} className="flex flex-col items-center">
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
