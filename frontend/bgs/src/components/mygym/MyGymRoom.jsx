import React, { useState } from "react";

const colors = ["#ffcccc", "#ffffcc", "#ccffcc", "#F5F1D9"];

const MyGymRoom = () => {
  const [roomColor, setRoomColor] = useState("#F5F1D9"); // 방 벽 색상
  const [items, setItems] = useState([]); // 배치된 아이템


  const onDragItem = (id, x, y) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, x, y } : item
      )
    );
  };

  return (
    <div className="relative h-screen flex flex-col items-center">
      {/* 육각형 방 */}
      <div
        className="relative w-96 h-96"
        style={{
          clipPath: "polygon(50% 7%, 100% 25%, 100% 75%, 50% 93%, 0% 75%, 0% 25%)",
          backgroundColor: roomColor,
        }}
      >
        {items.map((item) => (
          <img
            key={item.id}
            src={item.image}
            alt={item.name}
            className="absolute w-16 h-16"
            style={{ top: item.y, left: item.x }}
            draggable
            onDragEnd={(e) =>
              onDragItem(item.id, e.clientX - 50, e.clientY - 50)
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
            onClick={() => setRoomColor(color)}
          />
        ))}
      </div>
    </div>
  );
};

export default MyGymRoom;
