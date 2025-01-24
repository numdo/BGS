import React, { useState, useRef } from "react";

const colors = ["#ffcccc", "#ffffcc", "#ccffcc", "#F5F1D9"];

const MyGymRoom = () => {
  const [roomColor, setRoomColor] = useState("#F5F1D9"); // 방 벽 색상
  const [items, setItems] = useState([]); // 배치된 아이템
  const roomRef = useRef(null); // 방 DOM 참조

  // 아이템 드래그 시 방 기준 좌표 계산
  const onDragItem = (id, clientX, clientY) => {
    const rect = roomRef.current.getBoundingClientRect(); // 방 크기 및 위치 가져오기
    const offsetX = clientX - rect.left; // 방 기준 x 좌표
    const offsetY = clientY - rect.top; // 방 기준 y 좌표

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, x: offsetX, y: offsetY } : item
      )
    );
  };

  return (
    <div className="relative h-screen flex flex-col items-center">
      {/* 육각형 방 */}
      <div
        ref={roomRef} // 방 DOM 요소 참조
        className="relative w-96 h-96"
        style={{
          clipPath: "polygon(50% 7%, 100% 25%, 100% 75%, 50% 93%, 0% 75%, 0% 25%)",
          backgroundColor: roomColor,
        }}
      >
        {/* 아이템 렌더링 */}
        {items.map((item) => (
          <img
            key={item.id}
            src={item.image}
            alt={item.name}
            className="absolute w-16 h-16"
            style={{ top: item.y, left: item.x }}
            draggable
            onDragEnd={(e) =>
              onDragItem(item.id, e.clientX, e.clientY) // 드래그 종료 시 호출
            }
          />
        ))}
      </div>

      {/* 색상 팔레트 */}
      <div className="flex space-x-4 mt-4">
        {colors.map((color, index) => (
          <button
            key={index}
            className="w-8 h-8 rounded-full"
            style={{ backgroundColor: color }}
            onClick={() => setRoomColor(color)} // 방 색상 변경
          />
        ))}
      </div>
    </div>
  );
};

export default MyGymRoom;