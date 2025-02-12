// src/components/mygym/MyGymRoomView.jsx
import React from "react";
import useMyGymStore from "../../stores/useMyGymStore";

const MyGymRoomView = ({ userId }) => {
  const { myGym } = useMyGymStore();

  // deleted가 false인 아이템만 표시
  const visibleItems = myGym.places.filter((it) => !it.deleted);

  return (
    <div className="relative flex flex-col items-center">
      {/* 전체 방 구조물을 감싸는 컨테이너에 drop-shadow 적용 */}
      <div
        className="relative w-96 h-96"
        style={{
          filter: "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.4))",
        }}
      >
        {/* 윗부분: 마이짐 벽 (폴리곤 모양) */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            clipPath:
              "polygon(50% 12%, 100% 30%, 100% 65%, 50% 45%, 0% 65%, 0% 30%)",
            backgroundColor: myGym.wallColor,
            zIndex: 1,
            boxShadow: "inset 0 4px 8px rgba(0, 0, 0, 0.3)",
            backgroundImage: `linear-gradient(${myGym.wallColor}, ${myGym.wallColor}),
                              radial-gradient(circle at center, rgba(0, 0, 0, 0.3) 0%, transparent 15%)`,
            backgroundBlendMode: "multiply",
          }}
        />
        {/* 아랫부분: 바닥 (폴리곤 모양) */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            clipPath: "polygon(50% 45%, 100% 65%, 50% 85%, 0% 65%)",
            backgroundColor: "#999999",
            zIndex: 0,
            boxShadow: "inset 0 -4px 6px rgba(0, 0, 0, 0.3)",
          }}
        />
        {/* 아이템 렌더링 */}
        {visibleItems.map((item) => {
          const isRotated = item.rotated || false;
          return (
            <div
              key={item.itemId}
              className="absolute"
              style={{ top: item.y, left: item.x, zIndex: 2 }}
            >
              <div className="relative w-16 h-16">
                <div
                  className="absolute inset-0"
                  style={{ transform: isRotated ? "scaleX(-1)" : "scaleX(1)" }}
                >
                  <img
                    src={item.image.url}
                    alt={item.name}
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyGymRoomView;
