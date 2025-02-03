import { useState } from "react";
import MyGymRoomEdit from "../components/mygym/MyGymRoomEdit";
import MyGymItem from "../components/mygym/MyGymItem";
import TopBar from "../components/TopBar";
import BottomBar from "../components/BottomBar";
import SelectColor from "../components/mygym/SelectColor";

const MyGymPage = () => {
  // 방 아이템 관련 state
  const [items, setItems] = useState([]);
  const [roomColor, setRoomColor] = useState("#F5F1D9");

  // 초깃값 = false → 페이지 들어오면 먼저 ‘보기 모드’(편집X)
  const [isEditing, setIsEditing] = useState(false);

  // “편집하기” 버튼 클릭 → 편집 모드 ON
  const handleEditMode = () => {
    setIsEditing(true);
  };

  // “편집 완료” 버튼 클릭 → 편집 모드 OFF
  const handleFinishEdit = () => {
    setIsEditing(false);
    // 여기서 서버 저장 로직 등 가능
  };

  return (
    <div>
      <TopBar />
      <h1 className="text-2xl font-bold">내 마이짐</h1>

      {/* 보기 모드 vs 편집 모드 */}
      {isEditing ? (
        /* 편집 모드 */
        <>
          <MyGymRoomEdit
            items={items}
            setItems={setItems}
            roomColor={roomColor}
          />
          {/* 편집 시 색 변경 & 아이템 추가 가능 */}
          <MyGymItem setItems={setItems} />

          <button 
            onClick={handleFinishEdit} 
            className="bg-blue-400 px-4 py-2 rounded-full mt-4"
          >
            완료
          </button>
          <SelectColor setRoomColor={setRoomColor} />
        </>
      ) : (
        /* 보기 모드 */
        <>
          <MyGymRoomEdit
            items={items}
            setItems={setItems}
            roomColor={roomColor}
          />
          {/* 여기서는 편집 UI(SelectColor, MyGymItem)를 숨김 */}

          <button 
            onClick={handleEditMode} 
            className="bg-gray-300 px-4 py-2 rounded-full mt-4"
          >
            편집
          </button>
        </>
      )}
      <BottomBar />
    </div>
  );
};

export default MyGymPage;
