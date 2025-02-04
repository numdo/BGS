// src/pages/MyGymPage.jsx
import { useState, useEffect } from "react";
import TopBar from "../components/TopBar";
import BottomBar from "../components/BottomBar";
import MyGymRoomEdit from "../components/mygym/MyGymRoomEdit";
import MyGymRoomView from "../components/mygym/MyGymRoomView";
import MyGymItem from "../components/mygym/MyGymItem";
import SelectColor from "../components/mygym/SelectColor";
import MyGymRoomBgColor from "../components/mygym/MyGymRoomBgColor"

import useUserStore from "../stores/useUserStore";
import useMyGymStore from "../stores/useMyGymStore";

const MyGymPage = () => {
  // Zustand store: 화면배경(pageBgColor), 폴리곤색(wallColor), items
  const {
    pageBgColor, setPageBgColor,
    wallColor, setWallColor,
    items, setItems,
    fetchMyGym, updateMyGym
  } = useMyGymStore();

  // 편집 모드
  const [isEditing, setIsEditing] = useState(false);
  const handleEditMode = () => setIsEditing(true);
  const handleFinishEdit = async () => {
    const userId = localStorage.getItem("userId");
    console.log("MyGymPage handleFinishEdit -> userId:", userId);
    await updateMyGym(userId);
    setIsEditing(false);
  };

  // 유저 정보
  const { user, fetchUser } = useUserStore();

  // 페이지 로드 시
  useEffect(() => {
    fetchUser().then(() => {
      const userId = localStorage.getItem("userId");
      if (userId) {
        fetchMyGym(userId); // DB에서 마이짐 상태 불러오기
      }
    });
  }, []);

  return (
    // 전체 페이지 배경 → pageBgColor
    <div style={{ backgroundColor: pageBgColor, minHeight: "100vh" }}>
      <TopBar />

      <div className="flex justify-center items-center">
        <h1 className="text-2xl font-bold text-center py-2">
          {user.nickname} 마이짐
        </h1>

        {/* 편집 모드일 때만 → 화면 배경색 변경 버튼 등장 */}
        {isEditing && (
          <div className="ml-4">
            <MyGymRoomBgColor setBgColor={setPageBgColor} />
          </div>
        )}
      </div>

      {isEditing ? (
        // 편집 모드
        <>
          {/* 폴리곤 편집(아이템 드래그/삭제 등) */}
          <MyGymRoomEdit />

          <button
            onClick={handleFinishEdit}
            className="bg-green-500 px-4 py-2 rounded-full text-white"
          >
            완료
          </button>

          {/* 폴리곤 색상 변경 (SelectColor) */}
          <SelectColor setRoomColor={setWallColor} />

          {/* 아이템 목록 */}
          <MyGymItem setItems={setItems} />
        </>
      ) : (
        // 보기 모드
        <>
          <MyGymRoomView />
          <button
            onClick={handleEditMode}
            className="bg-blue-400 text-white px-4 py-2 rounded-full"
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
