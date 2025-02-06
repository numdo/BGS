// src/components/mygym/MyGymRoomEdit.jsx
import { useRef, useState } from "react";
import useMyGymStore from "../../stores/useMyGymStore";
import removeItemPng from "../../assets/icons/remove_item.png";
import Flip from "../../assets/icons/Flip.png";

const polygonRatios = [
  [0.0, 0.60],
  [0.5, 0.40],
  [1.0, 0.60],
  [0.5, 0.80],
  [1.0, 1.0],
];

// Ray-casting
function pointInPolygon(px, py, polygon) {
  let isInside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect =
      yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) isInside = !isInside;
  }
  return isInside;
}

const MyGymRoomEdit = () => {
  const roomRef = useRef(null);

  const [draggingItem, setDraggingItem] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [startCoord, setStartCoord] = useState({ x: 0, y: 0 });
  const [isDraggingMode, setIsDraggingMode] = useState(false);

  // 폴리곤 색은 wallColor, 아이템들(items)
  const { myGym, setMyGym } = useMyGymStore();

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

    const diffX = e.clientX - startCoord.x;
    const diffY = e.clientY - startCoord.y;
    const distance = Math.sqrt(diffX * diffX + diffY * diffY);
    if (distance > 5 && !isDraggingMode) {
      setIsDraggingMode(true);
    }

    const { id, offsetX, offsetY } = draggingItem;
    const rect = roomRef.current.getBoundingClientRect();

    let newX = e.clientX - rect.left - offsetX;
    let newY = e.clientY - rect.top - offsetY;

    const itemWidth = 64;
    const itemHeight = 64;

    // 사각 범위 제한
    if (newX < 0) newX = 0;
    if (newY < 0) newY = 0;
    if (newX > rect.width - itemWidth) newX = rect.width - itemWidth;
    if (newY > rect.height - itemHeight) newY = rect.height - itemHeight;

    // 폴리곤 내부 체크
    const centerX = newX + itemWidth / 2;
    const centerY = newY + itemHeight / 2;
    const polygonPx = polygonRatios.map(([rx, ry]) => [
      rx * rect.width,
      ry * rect.height,
    ]);
    if (!pointInPolygon(centerX, centerY, polygonPx)) {
      return;
    }

    // 좌표 업데이트
    const newArr = myGym.places.map((it) =>
      it.id === id ? { ...it, x: newX, y: newY } : it
    );
    const obj = { ...myGym, places: newArr }
    setMyGym(obj);
  };

  // pointerUp
  const handlePointerUp = () => {
    if (!isDraggingMode && draggingItem) {
      const { id } = draggingItem;
      setSelectedItemId((prev) => (prev === id ? null : id));
    }
    setDraggingItem(null);
  };

  // 삭제 -> 'deleted=true'로 세팅(소프트 삭제)
  const removeItem = (id) => {
    const newArr = myGym.places.map((it) => {
      if (it.id === id) {
        return { ...it, deleted: true };
      }
      return it;
    });
    setMyGym({ ...myGym, places: newArr });
  };

  // 좌우 반전
  const toggleFlip = (id) => {
    const newArr = myGym.places.map((it) => {
      if (it.id === id) {
        return { ...it, flipped: !it.flipped };
      }
      return it;
    });
    setMyGym({ ...myGym, places: newArr });
  };

  // 렌더링 시 deleted==true인 아이템은 표시 안 함
  const visibleItems = myGym.places.filter((it) => !it.deleted);

  return (
    <div className="relative flex flex-col items-center">
      <div
        ref={roomRef}
        className="relative w-96 h-96"
        style={{ touchAction: "none" }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* 윗부분 - 폴리곤 벽색 */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            clipPath:
              "polygon(50% 7%, 100% 25%, 100% 60%, 50% 40%, 0% 60%, 0% 25%)",
            backgroundColor: myGym.wallColor,
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

        {/* 아이템들 (deleted=false)만 */}
        {visibleItems.map((item) => {
          const isFlipped = item.flipped || false;
          return (
            <div
              key={item.itemId}
              className="absolute"
              style={{ top: item.y, left: item.x, zIndex: 2 }}
              onPointerDown={(e) => handlePointerDown(e, item)}
            >
              <div className="relative w-16 h-16">
                {/* 기구 이미지 (좌우 반전) */}
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
                    transition-all duration-300
                    ${selectedItemId === item.id ? "opacity-100 scale-100" : "opacity-0 scale-0"}
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
                    transition-all duration-300
                    ${selectedItemId === item.id ? "opacity-100 scale-100" : "opacity-0 scale-0"}
                  `}
                  style={{ transform: "translateX(-10%)" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyGymRoomEdit;
