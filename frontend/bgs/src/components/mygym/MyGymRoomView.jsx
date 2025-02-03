// src/components/mygym/MyGymRoomView.jsx
import React from "react";

const MyGymRoomView = ({ items, roomColor }) => {
  return (
    <div className="relative w-96 h-96 mx-auto">
      {/* 윗부분 */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          clipPath:
            "polygon(50% 7%, 100% 25%, 100% 60%, 50% 40%, 0% 60%, 0% 25%)",
          backgroundColor: roomColor,
          zIndex: 1,
        }}
      />

      {/* 아랫부분 (회색) */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          clipPath:
            "polygon(0% 60%, 50% 40%, 100% 60%, 50% 80%, 100% 100%)",
          backgroundColor: "#999999",
          zIndex: 0,
        }}
      />

      {/* 아이템들 (드래그/삭제/반전 없음) */}
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute"
          style={{
            top: item.y,
            left: item.x,
            zIndex: 2,
          }}
        >
          <div className="relative w-16 h-16">
            {/* 기구 이미지(좌우 반전도 표시만) */}
            <div
              className="absolute inset-0"
              style={{
                transform: item.flipped ? "scaleX(-1)" : "scaleX(1)",
              }}
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyGymRoomView;
