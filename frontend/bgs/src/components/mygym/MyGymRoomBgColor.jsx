import React from "react";

// 6개 색상
const colors = ["#FFFFFF","#484547", "#EA871E",  "#79B465", "#005AFF", "#9E3AC3"];

const BackGroundColorButton = ({ setBgColor }) => {
  return (
    <div className="flex flex-wrap gap-4 p-4 items-center justify-center">

      {colors.map((color) => (
        <button
          key={color}
          onClick={() => setBgColor(color)}
          className="w-4 h-6 rounded-full border-2 border-white shadow-md flex flex-col-"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
};

export default BackGroundColorButton;
