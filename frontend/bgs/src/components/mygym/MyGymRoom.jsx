import { useRef, useState } from "react";
import removeItemPng from "../../assets/remove_item.png";
import selectColorPng from "../../assets/selectcolor.png";
import leftRightTwistPng from "../../assets/left_right_twist.png";

const colors = ["#ffcccc", "#ffffcc", "#ccffcc", "#F5F1D9"];

const MyGymRoom = ({ items, setItems, roomColor, setRoomColor }) => {
  const roomRef = useRef(null);

  const [draggingItem, setDraggingItem] = useState(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);

  // 클릭 vs 드래그 판단
  const [startCoord, setStartCoord] = useState({ x: 0, y: 0 });
  const [isDraggingMode, setIsDraggingMode] = useState(false);

  // === 드래그 로직 ===
  const handlePointerDown = (e, item) => {
    e.preventDefault();
    setIsDraggingMode(false);
    setStartCoord({ x: e.clientX, y: e.clientY });

    const rect = roomRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - item.x;
    const offsetY = e.clientY - rect.top - item.y;
    setDraggingItem({ id: item.id, offsetX, offsetY });
  };

  const handlePointerMove = (e) => {
    if (!draggingItem) return;
    e.preventDefault();

    const diffX = e.clientX - startCoord.x;
    const diffY = e.clientY - startCoord.y;
    const distance = Math.sqrt(diffX * diffX + diffY * diffY);
    if (distance > 5 && !isDraggingMode) {
      setIsDraggingMode(true);
    }

    const { id, offsetX, offsetY } = draggingItem;
    const rect = roomRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - offsetX;
    const newY = e.clientY - rect.top - offsetY;

    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, x: newX, y: newY } : it))
    );
  };

  const handlePointerUp = () => {
    if (!isDraggingMode && draggingItem) {
      const { id } = draggingItem;
      setSelectedItemId((prev) => (prev === id ? null : id));
    }
    setDraggingItem(null);
  };

  // 색상 팔레트
  const togglePalette = () => {
    setIsPaletteOpen((prev) => !prev);
  };

  // 아이템 삭제
  const removeItem = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    if (selectedItemId === id) {
      setSelectedItemId(null);
    }
  };

  // 좌우 반전 토글 (item.flipped: boolean)
  const toggleFlip = (id) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const currentFlipped = it.flipped || false;
          return { ...it, flipped: !currentFlipped };
        }
        return it;
      })
    );
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* 방 영역 */}
      <div
        ref={roomRef}
        className="relative w-96 h-96"
        style={{
          clipPath:
            "polygon(50% 7%, 100% 25%, 100% 60%, 50% 80%, 0% 60%, 0% 25%)",
          backgroundColor: roomColor,
          touchAction: "none",
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {items.map((item) => {
          const isFlipped = item.flipped || false;
          return (
            <div
              key={item.id}
              className="absolute"
              style={{ top: item.y, left: item.x }}
              onPointerDown={(e) => handlePointerDown(e, item)}
            >
              {/* 크기 16x16의 래퍼. 아이콘들은 여기서 상대위치로 배치. */}
              <div className="relative w-16 h-16">
                {/* 운동기구 png 만 좌우 반전  DIV */}
                <div
                  className="absolute inset-0"
                  style={{
                    transform: isFlipped ? "scaleX(-1)" : "scaleX(1)",
                    transformOrigin: "center",
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full"
                  />
                </div>

                {/*  삭제 아이콘 */}
                <img
                  src={removeItemPng}
                  alt="Remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item.id);
                  }}
                  className={`
                    absolute w-6 h-6 cursor-pointer
                    -top-2 -right-2
                    transition-all duration-300 transform
                    ${
                      selectedItemId === item.id
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-0"
                    }
                  `}
                />

                {/*  좌우 반전 아이콘 */}
                <img
                  src={leftRightTwistPng}
                  alt="Flip"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFlip(item.id);
                  }}
                  className={`
                    absolute w-6 h-6 cursor-pointer
                    -top-2 left-0
                    transition-all duration-300 transform
                    ${
                      selectedItemId === item.id
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-0"
                    }
                  `}
                  style={{
                    // 위치 조정하고 싶으면 여기서
                    transform: "translateX(-10%)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 색상 선택 팔레트 */}
      <div className="mt-4 relative inline-block">
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
    </div>
  );
};

export default MyGymRoom;
