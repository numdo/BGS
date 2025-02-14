// src/pages/MyGymPage.jsx
import { useState, useEffect } from "react";
import TopBar from "../../components/bar/TopBar";
import BottomBar from "../../components/bar/BottomBar";
import MyGymRoomEdit from "../../components/mygym/MyGymRoomEdit";
import MyGymRoomView from "../../components/mygym/MyGymRoomView";
import MyGymItem from "../../components/mygym/MyGymItem";
import SelectColor from "../../components/mygym/SelectColor";
import "../../style.css";
import editicon from "../../assets/icons/editicon.png";

import useUserStore from "../../stores/useUserStore";
import useMyGymStore from "../../stores/useMyGymStore";
import { getMygym, updateMygym, getGuestBooks } from "../../api/Mygym";
import { getUser } from "../../api/User";

import mygymbackimg from "../../assets/images/mygymbackimg.png";

const MyGymPage = () => {
  // 유저 정보 및 마이짐 상태
  const { user, setUser } = useUserStore();
  const { myGym, setMyGym, setWallColor, setItems } = useMyGymStore();

  // 메모모달
  const [isOpen, setIsOpen] = useState(true);

  // 아이템창 토글 상태
  const [isItemOpen, setIsItemOpen] = useState(false);

  // 팔레트 눌렀을때 아이템 모달 on off
  const handlePaletteClick = () => {
    setIsItemOpen((prev) => !prev);
  };

  // 편집 모드 여부
  const [isEditing, setIsEditing] = useState(false);
  const handleEditMode = () => {
    setIsEditing(true);
    setIsItemOpen(true);
  };
  const handleFinishEdit = async () => {
    const { nickname, userId, ...obj } = myGym;
    const newPlaces = obj.places.map((item) => {
      const { createdAt, name, image, ...rest } = item;
      return rest;
    });
    const newObj = { ...obj, places: newPlaces };
    await updateMygym(userId, newObj);
    setIsEditing(false);
    setIsItemOpen(false);
  };

  // 방명록(댓글)
  const [visitorMemos, setVisitorMemos] = useState([]);

  // MyGymPage가 마운트될 때 유저 정보, 마이짐, 방명록 데이터를 불러옴
  useEffect(() => {
    async function enterMygymPage() {
      const response = await getUser();
      setUser(response);
      getMygym(response.userId).then((MyGym) => {
        setMyGym(MyGym);
      });
      try {
        // 최신 댓글 10개를 불러옴
        const data = await getGuestBooks(response.userId, 0, 10);
        const freshMemos = data.content.filter((memo) => !memo.deleted);
        setVisitorMemos(freshMemos);
      } catch (error) {
        console.error("방명록 불러오기 실패:", error);
      }
    }
    enterMygymPage();
  }, [setUser, setMyGym]);

  return (
    <div
      style={{
        backgroundColor: myGym.backgroundColor,
        minHeight: "100vh",
        backgroundImage: `url(${mygymbackimg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "repeat-x",
        animation: "moveBg 60s linear infinite",
        position: "relative",
      }}
    >
      <div className="flex justify-center items-center mb-5">
        <h1 className="text-3xl font-extrabold text-center py-2 drop-shadow-lg">
          {user.nickname} 마이짐
        </h1>
      </div>

      <div className="absolute top-10 right-2">
        {isEditing ? (
          <button
            onClick={handleFinishEdit}
            className="bg-primary px-4 py-2 rounded-full text-white w-14 h-10"
          >
            ✔
          </button>
        ) : (
          <button
            onClick={handleEditMode}
            className="bg-white text-white px-4 py-2 rounded-full shadow-md"
          >
            <img src={editicon} alt="편집" className="w-6 h-6" />
          </button>
        )}
      </div>

      {isEditing ? (
        // 편집 모드
        <>
          <MyGymRoomEdit />
          <SelectColor
            setRoomColor={setWallColor}
            onClick={handlePaletteClick}
          />
          {/* 편집버튼을 누르면 MyGymItem의 forceOpen이 true가 되어 슬라이드 업 */}
          <MyGymItem setItems={setItems} forceOpen={isItemOpen} />
        </>
      ) : (
        // 보기 모드
        <>
          <MyGymRoomView userId={user.userId} />
        </>
      )}

      <BottomBar />
    </div>
  );
};

export default MyGymPage;
