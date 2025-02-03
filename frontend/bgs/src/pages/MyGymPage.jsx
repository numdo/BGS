// src/pages/MyGymPage.jsx
import { useState } from "react";
import MyGymRoomEdit from "../components/mygym/MyGymRoomEdit";
import MyGymItem from "../components/mygym/MyGymItem";
import TopBar from "../components/TopBar";
import BottomBar from "../components/BottomBar";
import SelectColor from "../components/mygym/SelectColor";
// import MyGymRoomView from "../components/mygym/MyGymRoomView"; 
// (보기 전용 컴포넌트를 따로 만들 수도 있음)

const MyGymPage = () => {
  // “방/아이템” 상태
  const [items, setItems] = useState([]);
  const [roomColor, setRoomColor] = useState("#F5F1D9");

  // 편집 모드 vs 보기 모드
  const [isEditing, setIsEditing] = useState(true);

  // 편집 완료 핸들러
  const handleFinishEdit = () => {
    setIsEditing(true);
    // 여기서 서버에 저장 요청을 보내거나, DB에 반영할 수도 있음
  };

  // 편집 다시 시작
  const handleEditAgain = () => {
    setIsEditing(false);
  };

  return (
    <div>
      <TopBar />
      <h1 className="text-2xl font-bold">내 마이짐</h1>

      {isEditing ? (
        <>
        
          {/* 완료 후에는 편집 기능 없이 결과만 보여주기 */}
          <MyGymRoomEdit
            items={items}
            setItems={setItems}
            roomColor={roomColor}
            setRoomColor={setRoomColor}
          />

          <button onClick={handleEditAgain} className="bg-gray-300 px-4 py-2 rounded-full">
            편집
          </button>
          
          <BottomBar />
        </>
      ) : (
        <>
        {/* 편집 모드에서 MyGymRoomEdit 렌더 */}
        <MyGymRoomEdit
            items={items}
            setItems={setItems}
            roomColor={roomColor}
            setRoomColor={setRoomColor}
          />
          <button onClick={handleFinishEdit} className="bg-blue-400 px-4 py-2 rounded-full">
            완료
          </button>
          <SelectColor setRoomColor={setRoomColor}/>
          <MyGymItem setItems={setItems} />
        </>
      )}
      <BottomBar />
    </div>
  );
};

export default MyGymPage;
