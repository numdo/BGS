// src/components/mygym/MyGymRoomEdit.jsx
import { useRef, useState, useEffect } from "react";
import useMyGymStore from "../../stores/useMyGymStore";
import removeItemPng from "../../assets/icons/remove_item.png";
import flip from "../../assets/icons/flip.png";

const polygonRatios = [
  [0.5, 0.45], // 상 (예: 50% 가로, 45% 세로)
  [1.0, 0.65], // 우 (100% 가로, 65% 세로)
  [0.5, 0.80], // 하 (50% 가로, 85% 세로)
  [0.0, 0.60], // 좌 (0% 가로, 65% 세로)
];

// 이미지가 육각ㅎ형의 중앙에있는지 확인
function pointInPolygon(px, py, polygon) {
  let isInside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
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

  useEffect(() => {
    console.log("selectedItemId changed", selectedItemId);
  }, [selectedItemId]);

  useEffect(() => {
    console.log("draggingItem changed", draggingItem);
  }, [draggingItem]);

  const { myGym, setMyGym } = useMyGymStore();

  // pointerDown: 드래그 시작 시
  const handlePointerDown = (e, item) => {
    e.preventDefault();
    setIsDraggingMode(false);
    setStartCoord({ x: e.clientX, y: e.clientY });

    const rect = roomRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - item.x;
    const offsetY = e.clientY - rect.top - item.y;
    setDraggingItem({ id: item.itemId, offsetX, offsetY });
  };

  // pointerMove: 드래그 중
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

    // 사각 범위 내 제한
    if (newX < 0) newX = 0;
    if (newY < 0) newY = 0;
    if (newX > rect.width - itemWidth) newX = rect.width - itemWidth;
    if (newY > rect.height - itemHeight) newY = rect.height - itemHeight;

    // 폴리곤 내부에 위치하는지 체크
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
      it.itemId === id ? { ...it, x: newX, y: newY } : it
    );
    setMyGym({ ...myGym, places: newArr });
  };

  // pointerUp: 드래그 종료 또는 클릭
  const handlePointerUp = () => {
    if (!isDraggingMode && draggingItem) {
      const { id } = draggingItem;
      setSelectedItemId((prev) => (prev === id ? null : id));
    }
    setDraggingItem(null);
  };

  // 삭제: 아이템의 deleted를 true로 설정(소프트 삭제)
  const removeItem = (id) => {
    const newArr = myGym.places.map((it) => {
      if (it.itemId === id) {
        return { ...it, deleted: true };
      }
      return it;
    });
    setMyGym({ ...myGym, places: newArr });
  };

  // 좌우 반전: rotated 상태 토글 (백엔드 필드와 일치)
  const toggleFlip = (id) => {
    const newArr = myGym.places.map((it) => {
      if (it.itemId === id) {
        console.log("it.itemId", it.itemId);
        return { ...it, rotated: !it.rotated };
      }
      return it;
    });
    setMyGym({ ...myGym, places: newArr });
  };

  // deleted가 false인 아이템만 렌더링
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
        <div
        className="relative w-96 h-96"
        style={{
          filter: "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.4))",
        }}
      >
        {/* 윗부분 - 폴리곤 벽 색 */}
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
        {/* 아랫부분 */}
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
        {/* 아이템들 (deleted=false인 것만) */}
        {visibleItems.map((item) => {
          // 백엔드의 rotated 필드를 확인하도록 수정
          const isRotated = item.rotated || false;
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
                    transform: isRotated ? "scaleX(-1)" : "scaleX(1)",
                  }}
                >
                  <img
                    src={item.image.url}
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
                    removeItem(item.itemId);
                  }}
                  className={`
                    absolute w-6 h-6 cursor-pointer
                    -top-2 -right-2
                    transition-all duration-300
                    ${
                      selectedItemId === item.itemId
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-0"
                    }
                  `}
                />

                {/* 좌우 반전 아이콘 */}
                <img
                  src={flip}
                  alt="Flip"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFlip(item.itemId);
                  }}
                  className={`
                    absolute w-6 h-6 cursor-pointer
                    -top-2 left-0
                    transition-all duration-300
                    ${
                      selectedItemId === item.itemId
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-0"
                    }
                  `}
                  style={{ transform: "translateX(-10%)" }}
                />
              </div>
              </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};

export default MyGymRoomEdit;
