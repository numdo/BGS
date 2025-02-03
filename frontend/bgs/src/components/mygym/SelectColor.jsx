import { useState } from "react";
import selectColorPng from "../../assets/selectcolor.png";

const colors = ["#ffcccc", "#ffffcc", "#ccffcc", "#F5F1D9"];



const SelectColor = ({setRoomColor}) => {
    const [isPaletteOpen, setIsPaletteOpen] = useState(false);
    

    // 팔레트 열기/닫기
    const togglePalette = () => {
        setIsPaletteOpen((prev) => !prev);
    };
    return(<>
    {/* 색상 선택 팔레트 */}
          <div className="mt-4 relative inline-block flex flex-col items-center w-full">
            <img
              src={selectColorPng}
              alt="Select Color"
              className="w-12 h-12 cursor-pointer"
              onClick={togglePalette}
            />
    
            <div
              className={`
                absolute left-1/2 top-full
                flex items-center
                transform -translate-x-1/2
                transition-all duration-500 ease-in-out
                ${
                  isPaletteOpen
                    ? "opacity-100 scale-100 translate-y-2"
                    : "opacity-0 scale-0 translate-y-0"
                }
              `}
              style={{ transformOrigin: "top center" }}
            >
              {colors.map((color, idx) => (
                <button
                  key={idx}
                  className="w-8 h-8 rounded-full border-2 border-white shadow-md mx-1"
                  style={{ backgroundColor: color }}
                  onClick={() => setRoomColor(color)}
                />
              ))}
            </div>
        </div>
        </>
    )

    
}

export default SelectColor;