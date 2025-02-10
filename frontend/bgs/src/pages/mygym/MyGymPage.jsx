// src/pages/MyGymPage.jsx
import { useState, useEffect } from "react";
import TopBar from "../../components/bar/TopBar";
import BottomBar from "../../components/bar/BottomBar";
import MyGymRoomEdit from "../../components/mygym/MyGymRoomEdit";
import MyGymRoomView from "../../components/mygym/MyGymRoomView";
import MyGymItem from "../../components/mygym/MyGymItem";
import SelectColor from "../../components/mygym/SelectColor";
import MyGymRoomBgColor from "../../components/mygym/MyGymRoomBgColor"
import VisitorMemo from "../../components/mygym/VisitorMemo";
import '../../style.css'

import useUserStore from "../../stores/useUserStore";
import useMyGymStore from "../../stores/useMyGymStore";
import { getMygym, updateMygym, getGuestBooks, createGuestBooks } from "../../api/Mygym";
import { getUser } from "../../api/User";

import mygymbackimg from "../../assets/images/mygymbackimg.png"

const MyGymPage = () => {
  // 유저 정보
  const { user, setUser } = useUserStore();
  const { myGym, setMyGym, pageBgColor, setPageBgColor, setWallColor, setItems, updateMyGym } = useMyGymStore();
  // Zustand store: 화면배경(pagqeBgColor), 폴리곤색(wallColor), items

  // 편집 모드
  const [isEditing, setIsEditing] = useState(false);
  const handleEditMode = () => setIsEditing(true);
  const handleFinishEdit = async () => {
    const { nickname, userId, ...obj } = myGym
    console.log("MyGymPage handleFinishEdit -> userId:", userId);
    console.log("mygym:", myGym)
    console.log("obj", obj)
    const newPlaces = obj.places.map(item => { const { createdAt, name, image, ...restitem } = item; return restitem })
    const newObj = { ...obj, places: newPlaces }
    console.log("newObj", newObj)
    await updateMygym(userId, newObj);
    setIsEditing(false);
  };

  useEffect(() => {
    async function enterMygymPage() {
      const response = await getUser()
      getMygym(response.userId).then(MyGym => { console.log("mygym res", MyGym); setMyGym(MyGym) })
      setUser(response)
    }
    enterMygymPage()
  }, [])

  useEffect(() => {
    console.log("mygym", myGym)
  }, [myGym])
  useEffect(() => {
    console.log("user", user)
  }, [user])
  return (
    // 전체 페이지 배경 → pageBgColor
    <div style={{ 
      backgroundColor: myGym.backgroundColor, 
      minHeight: "100vh", 
      backgroundImage : `url(${mygymbackimg})`, 
      backgroundSize : 'cover', 
      backgroundPosition : 'center', 
      backgroundRepeat : 'repeat-x',
      animation : 'moveBg 20s linear infinite', 
      }}>
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
          <MyGymRoomView userId={user.userId}/>
          <button
            onClick={handleEditMode}
            className="bg-blue-400 text-white px-4 py-2 rounded-full"
          >
            편집
          </button>
          <VisitorMemo userId={user.userId} />
        </>
      )}

      <BottomBar />
    </div>
  );
};

export default MyGymPage;
