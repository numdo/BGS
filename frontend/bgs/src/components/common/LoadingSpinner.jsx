// components/common/BeatLoader.jsx
import React from "react";

const BeatLoader = ({ color = "#2563eb", size = 15, margin = 2 }) => {
  const dotStyle = {
    backgroundColor: color,
    width: size,
    height: size,
    margin: margin,
    borderRadius: "50%",
    display: "inline-block",
    animation: "beat 0.7s infinite ease-in-out both",
  };

  return (
    <div className="flex items-center justify-center">
      <div style={{ ...dotStyle, animationDelay: "-0.32s" }} />
      <div style={{ ...dotStyle, animationDelay: "-0.16s" }} />
      <div style={{ ...dotStyle, animationDelay: "0s" }} />
      <style>
        {`
          @keyframes beat {
            0%, 80%, 100% {
              transform: scale(0);
            }
            40% {
              transform: scale(1);
            }
          }
        `}
      </style>
    </div>
  );
};

export default BeatLoader;
