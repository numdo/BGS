// src/components/mygym/MyGymItem.jsx
import { useState } from "react";
import useMyGymStore from "../../stores/useMyGymStore";
// 예시 아이템 이미지 import
import BenchPress from "../../assets/items/benchpress.png";
import LatPulldown from "../../assets/items/Latpulldown.png";
import Deadlift from "../../assets/items/deadlift.png";
import cycle from "../../assets/items/cycle.png";
import runningmachine from "../../assets/items/runningmachine.png";
import pullup from "../../assets/items/pullup.png";
import dumbbell from "../../assets/items/dumbbell.png";
import men from "../../assets/items/men.png";
import women from "../../assets/items/women.png";

const MyGymItem = () => {
  const { myGym, setMyGym } = useMyGymStore();
  const [isOpen, setIsOpen] = useState(false);
  const addItem = (item) => {
    console.log(`${item.name} 추가`);

    // 기존 items를 가져오기
    // 만약 props로 받는 경우, 상위에서 items도 필요하니...
    // 여기선 Zustand를 직접 써도 됨:
    // const { items, setItems } = useMyGymStore.getState();

    // (간단) Zustand에서 현재 items 가져옴

    // 중복 체크(예: name)
    if (myGym.places.some((prev) => prev.name === item.name && !prev.deleted)) {
      alert(`이미 '${item.name}'가(이) 배치되었습니다!`);
      return;
    }
    console.log("item", item)
    // 새 아이템
    const newItem = {
      itemId: item.id, // 임시 itemId
      image: item.image,
      name: item.name,
      x: 160,
      y: 160,
      rotated: false,
      deleted: false,   // 새 아이템은 당연히 삭제X
    };
    const newArr = [...myGym.places, newItem];
    setMyGym({ ...myGym, places: newArr });
    setIsOpen(false);
  };

  const toggleBox = () => {
    setIsOpen(!isOpen);
  };

  const gymItems = [
    { id: 1, name: "여자", image: women },
    { id: 2, name: "남자", image: men },
    { id: 3, name: "벤치프레스", image: BenchPress },
    { id: 4, name: "랫풀다운", image: LatPulldown },
    { id: 5, name: "데드리프트", image: Deadlift },
    { id: 6, name: "사이클", image: cycle },
    { id: 7, name: "런닝머신", image: runningmachine },
    { id: 8, name: "덤벨", image: dumbbell },
    { id: 9, name: "풀업", image: pullup },
  ];

  return (
    <div
      className={`fixed bottom-12 left-0 w-full bg-sky-100 rounded-t-3xl shadow-lg transition-transform duration-500 ${isOpen ? "translate-y-0" : "translate-y-[70%]"
        }`}
    >
      <button
        onClick={toggleBox}
        className="w-full py-3 bg-sky-100 text-gray-800 font-bold rounded-t-3xl"
      >
        ㅡ
      </button>

      <div className="p-4 overflow-x-auto scroll-snap-x-mandatory flex space-x-4">
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
              {group.map((it, idx) => (
                <div
                  key={idx}
                  onClick={() => addItem(it)}
                  className="flex flex-col items-center cursor-pointer"
                >
                  <img
                    src={it.image}
                    alt={it.name}
                    className="w-16 h-16 object-contain mb-2"
                  />
                  <span className="text-sm font-medium">{it.name}</span>
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default MyGymItem;
