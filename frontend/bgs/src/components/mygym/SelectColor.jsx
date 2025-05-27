import { useState } from "react";
import selectColorPng from "../../assets/images/selectcolor.png";
import useMyGymStore from "../../stores/useMyGymStore";

const colors = ["#ffcccc", "#ffffcc", "#ccffcc", "#F5F1D9"];

const SelectColor = ({ setRoomColor, onClick }) => {
  const { myGym, setMyGym } = useMyGymStore();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // 팔레트 열기/닫기 + 부모 컴포넌트 onClick 호출
  const togglePalette = () => {
    setIsPaletteOpen((prev) => !prev);
    if (onClick) onClick(); // 부모의 아이템창 토글 함수 실행
  };

  return (
    <div className="mt-4 relative inline-block flex flex-col items-center w-full">
      {/* 팔레트 토글 버튼 */}
      <img
        src={selectColorPng}
        alt="Select Color"
        className="w-12 h-12 cursor-pointer"
        onClick={togglePalette}
      />

      {/* 색상 팔레트 */}
      <div
        className={`absolute left-1/2 top-full flex items-center transform -translate-x-1/2
          transition-all duration-500 ease-in-out
          ${isPaletteOpen ? "opacity-100 scale-100 translate-y-2" : "opacity-0 scale-0 translate-y-0"}`}
        style={{ transformOrigin: "top center" }}
      >
        {colors.map((color, idx) => (
          <button
            key={idx}
            className="w-8 h-8 rounded-full border-2 border-white shadow-md mx-1"
            style={{ backgroundColor: color }}
            onClick={(e) => {
              e.stopPropagation(); // 부모 클릭 이벤트 방지
              setMyGym({ ...myGym, wallColor: color }); // 색상 변경
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SelectColor;
