import { useState } from "react";

const MyGymItem = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleBox = () => {
    setIsOpen(!isOpen); // 열림/닫힘 상태 변경
  };

//   const 

  return (
    <>
      {/* 네모 박스 */}
      <div
        className={`fixed bottom-12 left-0 w-full bg-sky-100 rounded-t-3xl shadow-lg transition-transform duration-500 ${
          isOpen ? "translate-y-0" : "translate-y-[77%]"
        }`}
      >
        {/* 그림자를 위한 상단 요소 */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-300 rounded-t-3xl shadow-md"></div>
        {/* 열기/닫기 토글?버튼 */}
        <button
          onClick={toggleBox}
          className="w-full py-3 bg-sky-100 text-gray-800 font-bold rounded-t-10xl"
        >
          ㅡ
          
        </button>

        {/* 아이템들 */}
        <div className="p-4 grid grid-cols-3 gap-4">
          {[...Array(9)].map((_, index) => (
            <div
              key={index}
              className="w-full h-20 bg-gray-200 flex items-center justify-center rounded-md"
            >
              <span>아이템 {index + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MyGymItem;
