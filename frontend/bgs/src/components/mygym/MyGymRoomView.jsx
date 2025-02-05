// src/components/mygym/MyGymRoomView.jsx
import React from "react";
import useMyGymStore from "../../stores/useMyGymStore";

const MyGymRoomView = () => {
  const { items, wallColor } = useMyGymStore();

  // deleted=false인 아이템만 표시
  const visibleItems = items.filter((it) => !it.deleted);

  return (
    // (1) 상위 래퍼: 수직 정렬 & 가운데 정렬
    <div className="relative flex flex-col items-center">
      {/* (2) 실제 방 컨테이너 */}
      <div className="relative w-96 h-96">
        {/* 윗부분: 마이짐 벽색 */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            clipPath: "polygon(50% 7%, 100% 25%, 100% 60%, 50% 40%, 0% 60%, 0% 25%)",
            backgroundColor: wallColor,
            zIndex: 1,
          }}
        />
        {/* 아랫부분 */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            clipPath: "polygon(0% 60%, 50% 40%, 100% 60%, 50% 80%, 100% 100%)",
            backgroundColor: "#999999",
            zIndex: 0,
          }}
        />
        {/* 아이템 렌더링 */}
        {visibleItems.map((item) => {
          const isFlipped = item.flipped || false;
          return (
            <div
              key={item.id}
              className="absolute"
              style={{ top: item.y, left: item.x, zIndex: 2 }}
            >
              <div className="relative w-16 h-16">
                <div
                  className="absolute inset-0"
                  style={{
                    transform: isFlipped ? "scaleX(-1)" : "scaleX(1)",
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
          );
        })}
      </div>
    </div>
  );
};

export default MyGymRoomView;
