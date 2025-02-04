import { useState, useEffect } from "react";
import MyGymRoomEdit from "../components/mygym/MyGymRoomEdit";
import MyGymRoomView from "../components/mygym/MyGymRoomView";
import MyGymItem from "../components/mygym/MyGymItem";
import SelectColor from "../components/mygym/SelectColor";
import TopBar from "../components/TopBar";
import BottomBar from "../components/BottomBar";
import useUserStore from "../stores/useUserStore";
import useMyGymStore from "../stores/useMyGymStore";
import BackGroundColorButton from "../components/mygym/MyGymRoomBgColor";

const MyGymPage = () => {
  const { items, setItems, roomColor, setRoomColor, fetchMyGym, updateMyGym } = useMyGymStore();

  // 편집모드 false -> 보기모드 기본
  const [isEditing, setIsEditing] = useState(false);

  const handleEditMode = () => setIsEditing(true);
  const handleFinishEdit = async () => {
    const userId = localStorage.getItem("userId");
    await updateMyGym(userId);
    setIsEditing(false);
  };

  const { user, fetchUser } = useUserStore();

  useEffect(() => {
    fetchUser().then(() => {
      const userId = localStorage.getItem("userId");
      if (userId) {
        fetchMyGym(userId);
      }
    });
  }, []);

  // polygon 색과는 별개로, 화면 전체를 감싸는 div의 배경색
  const [pageBgColor, setPageBgColor] = useState("#FFFFFF");

  return (
    <div style={{ backgroundColor: pageBgColor, minHeight: "100vh" }}>
      <TopBar />

      {/* 상단부 */}
      <div className="flex justify-center items-center">
        <h1 className="text-2xl font-bold text-center py-2">{user.nickname} 마이짐</h1>

        {isEditing && (
          <div className="ml-4">
            {/* 여기에 setBgColor={setPageBgColor}를 넘겨주면, 버튼 클릭 시 pageBgColor 변경 */}
            <BackGroundColorButton setBgColor={setPageBgColor} />
          </div>
        )}
      </div>

      {isEditing ? (
        // 편집 모드
        <>
          <MyGymRoomEdit />

          <button
            onClick={handleFinishEdit}
            className="bg-green-500 px-4 py-2 rounded-full text-white"
          >
            보기모드
          </button>
          <SelectColor setRoomColor={setRoomColor} />
          <MyGymItem setItems={setItems} />
        </>
      ) : (
        // 보기 모드
        <>
          <MyGymRoomView items={items} roomColor={roomColor} />
          <button
            onClick={handleEditMode}
            className="bg-blue-400 text-white px-4 py-2 rounded-full"
          >
            편집모드
          </button>
        </>
      )}

      <BottomBar />
    </div>
  );
};

export default MyGymPage;
