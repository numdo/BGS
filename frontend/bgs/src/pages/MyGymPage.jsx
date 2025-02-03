import { useState } from "react";
import MyGymRoomEdit from "../components/mygym/MyGymRoomEdit";
import MyGymRoomView from "../components/mygym/MyGymRoomView";
import MyGymItem from "../components/mygym/MyGymItem";
import SelectColor from "../components/mygym/SelectColor";
import TopBar from "../components/TopBar";
import BottomBar from "../components/BottomBar";

const MyGymPage = () => {
  const [items, setItems] = useState([]);
  const [roomColor, setRoomColor] = useState("#F5F1D9");
  // 편집모드 false -> 보기모드 기본
  const [isEditing, setIsEditing] = useState(false);

  const handleEditMode = () => setIsEditing(true);
  const handleFinishEdit = () => setIsEditing(false);

  return (
    <div>
      <TopBar />
      <h1 className="text-2xl font-bold text-center py-2">내 마이짐</h1>

      {isEditing ? (
        /* 편집 모드 */
        <>
          <MyGymRoomEdit
            items={items}
            setItems={setItems}
            roomColor={roomColor}
          />

          <button onClick={handleFinishEdit} className="bg-green-500 px-4 py-2 rounded-full text-white">
            완료
          </button>
          <SelectColor setRoomColor={setRoomColor} />
          <MyGymItem setItems={setItems} />
        </>
      ) : (
        /* 보기 모드 */
        <>
          <MyGymRoomView
            items={items}
            roomColor={roomColor}
          />
          <button onClick={handleEditMode} className="bg-blue-400 text-white px-4 py-2 rounded-full ">
            편집
          </button>
        </>
      )}

      <BottomBar />
    </div>
  );
};

export default MyGymPage;
