import { useRef, useState } from "react";

const colors = ["#ffcccc", "#ffffcc", "#ccffcc", "#F5F1D9"];

/**
 * props:
 *  - items: [{id, name, image, x, y}, ...]
 *  - setItems: 아이템 상태 변경 함수
 *  - roomColor: 방 배경색
 *  - setRoomColor: 방 배경색 변경 함수
 */
const MyGymRoom = ({ items, setItems, roomColor, setRoomColor }) => {
  const roomRef = useRef(null);

  // 현재 드래그 중인 아이템 정보
  // 예: { id: 1234, offsetX: 30, offsetY: 20 }
  const [draggingItem, setDraggingItem] = useState(null);

  // 아이템을 누른 순간(pointerDown)
  const handlePointerDown = (e, item) => {
    // 터치 움직임이 스크롤로 이어지지 않도록
    e.preventDefault();

    // 방의 위치를 구해서, 현재 커서(또는 터치)와 해당 아이템의 상대 오프셋을 계산
    const rect = roomRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - item.x;
    const offsetY = e.clientY - rect.top - item.y;

    setDraggingItem({
      id: item.id,
      offsetX,
      offsetY,
    });
  };

  // 드래그 중(pointerMove)
  const handlePointerMove = (e) => {
    if (!draggingItem) return;

    // 터치 디폴트 스크롤 막기
    e.preventDefault();

    const { id, offsetX, offsetY } = draggingItem;
    const rect = roomRef.current.getBoundingClientRect();

    // 새 좌표 = 현재 포인터 - 방의 왼쪽/위쪽 - 처음 눌렀을 때의 아이템 오프셋
    const newX = e.clientX - rect.left - offsetX;
    const newY = e.clientY - rect.top - offsetY;

    // items 상태 배열에서 해당 아이템만 좌표 갱신
    setItems((prevItems) =>
      prevItems.map((it) =>
        it.id === id
          ? { ...it, x: newX, y: newY }
          : it
      )
    );
  };

  // 드래그가 끝난 순간(pointerUp)
  const handlePointerUp = (e) => {
    setDraggingItem(null);
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* 방 영역 */}
      <div
        ref={roomRef}
        className="relative w-96 h-96"
        style={{
          clipPath: "polygon(50% 7%, 100% 25%, 100% 75%, 50% 93%, 0% 75%, 0% 25%)",
          backgroundColor: roomColor,
          // 터치 시 스크롤 되지 않게 하는 설정 (필수)
          touchAction: "none",
        }}
        // 전체 방 영역에서 pointerMove, pointerUp을 감지
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}  // 바깥으로 벗어났을 때도 드래그 종료
      >
        {/* 아이템들 */}
        {items.map((item) => (
          <img
            key={item.id}
            src={item.image}
            alt={item.name}
            className="absolute w-16 h-16"
            style={{ top: item.y, left: item.x }}
            // draggable={false}  <- 기본 드래그 비활성화 (원하는 경우)
            onPointerDown={(e) => handlePointerDown(e, item)}
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
