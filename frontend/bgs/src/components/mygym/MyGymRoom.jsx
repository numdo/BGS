import { useRef, useState } from "react";
import removeItemPng from "../../assets/remove_item.png";
import selectColorPng from "../../assets/selectcolor.png";
import Flip from "../../assets/Flip.png";

const colors = ["#ffcccc", "#ffffcc", "#ccffcc", "#F5F1D9"];

const MyGymRoom = ({ items, setItems, roomColor, setRoomColor }) => {
  const roomRef = useRef(null);

  const [draggingItem, setDraggingItem] = useState(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);

  const [startCoord, setStartCoord] = useState({ x: 0, y: 0 });
  const [isDraggingMode, setIsDraggingMode] = useState(false);

  // pointerDown
  const handlePointerDown = (e, item) => {
    e.preventDefault();
    setIsDraggingMode(false);
    setStartCoord({ x: e.clientX, y: e.clientY });

    const rect = roomRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - item.x;
    const offsetY = e.clientY - rect.top - item.y;
    setDraggingItem({ id: item.id, offsetX, offsetY });
  };

  // pointerMove
  const handlePointerMove = (e) => {
    if (!draggingItem) return;
    e.preventDefault();

    // 클릭 vs 드래그 판정
    const diffX = e.clientX - startCoord.x;
    const diffY = e.clientY - startCoord.y;
    const distance = Math.sqrt(diffX * diffX + diffY * diffY);
    if (distance > 5 && !isDraggingMode) {
      setIsDraggingMode(true);
    }

    const { id, offsetX, offsetY } = draggingItem;
    const rect = roomRef.current.getBoundingClientRect();

    // 새 좌표
    let newX = e.clientX - rect.left - offsetX;
    let newY = e.clientY - rect.top - offsetY;

    // 아이템 크기: w-16, h-16 => 64 px
    const itemWidth = 64;
    const itemHeight = 64;

    // 사각 범위 제한
    if (newX < 0) newX = 0;
    if (newY < 0) newY = 0;
    if (newX > rect.width - itemWidth) {
      newX = rect.width - itemWidth;
    }
    if (newY > rect.height - itemHeight) {
      newY = rect.height - itemHeight;
    }

    // state 갱신
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, x: newX, y: newY } : it))
    );
  };

  // pointerUp
  const handlePointerUp = () => {
    if (!isDraggingMode && draggingItem) {
      const { id } = draggingItem;
      setSelectedItemId((prev) => (prev === id ? null : id));
    }
    setDraggingItem(null);
  };

  // 팔레트 열기/닫기
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

  // 좌우 반전
  const toggleFlip = (id) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const flipped = it.flipped || false;
          return { ...it, flipped: !flipped };
        }
        return it;
      })
    );
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* 방 컨테이너 */}
      <div
        ref={roomRef}
        className="relative w-96 h-96"
        style={{ touchAction: "none" }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
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

        {/* 아랫부분 */}
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

        {/* 아이템들 */}
        {items.map((item) => {
          const isFlipped = item.flipped || false;
          return (
            <div
              key={item.id}
              className="absolute"
              style={{
                top: item.y,
                left: item.x,
                zIndex: 2,
              }}
              onPointerDown={(e) => handlePointerDown(e, item)}
            >
              <div className="relative w-16 h-16">
                {/* 기구 이미지 */}
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

                {/* 삭제 아이콘 */}
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

                {/* 좌우 반전 아이콘 */}
                <img
                  src={Flip}
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
                        ? "opacity-100 scale-100 pointer-events-none"
                        : "opacity-0 scale-0 pointer-events-auto"
                    }
                  `}
                  style={{
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
