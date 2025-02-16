// src/pages/MyGymPage.jsx
import { useState, useEffect } from "react";
import TopBar from "../../components/bar/TopBar";
import BottomBar from "../../components/bar/BottomBar";
import MyGymRoomEdit from "../../components/mygym/MyGymRoomEdit";
import MyGymRoomView from "../../components/mygym/MyGymRoomView";
import MyGymItem from "../../components/mygym/MyGymItem";
import SelectColor from "../../components/mygym/SelectColor";
import MyGymViewVisitorMemo from "../../components/mygym/MyGymViewVisitorMemo";
import "../../style.css";
import editicon from "../../assets/icons/editicon.png";
import shopicon from "../../assets/icons/shopicon.png";

import useUserStore from "../../stores/useUserStore";
import useMyGymStore from "../../stores/useMyGymStore";
import { getMygym, updateMygym, getGuestBooks } from "../../api/Mygym";
import { getUser } from "../../api/User";

import mygymbackimg from "../../assets/images/mygymbackimg.png";
import ItemShopPage from "./ItemShopPage";

const MyGymPage = () => {
  // 유저 정보 및 마이짐 상태
  const { user, setUser } = useUserStore();
  const { myGym, setMyGym, setWallColor, setItems } = useMyGymStore();

  // 메모모달
  const [isOpen, setIsOpen] = useState(true);

  // 아이템창 토글 상태
  const [isItemOpen, setIsItemOpen] = useState(false);

  // 🎉 상점 모달 상태
  const [isShopOpen, setIsShopOpen] = useState(false);

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

      <div className="absolute top-10 right-2 flex flex-col gap-3">
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

        {/* 🎉 상점 버튼 */}
        <button
          onClick={() => setIsShopOpen(true)}
          className="bg-white px-4 py-2 z-30 flex items-center justify-center rounded-xl shadow-md"
        >
          <img src={shopicon} alt="상점" className="w-6 h-6" />
        </button>
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
          <div className="mt-10 mb-20">
          <MyGymViewVisitorMemo 
          userId={user.userId}
          visitorMemos={visitorMemos}
          setVisitorMemos={setVisitorMemos}
          />
          </div>
        </>
      )}

      {/* 🎯 상점 모달 (오른쪽에서 슬라이드) */}
      {isShopOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 flex justify-end"
          onClick={() => setIsShopOpen(false)} // 회색 부분 클릭 시 모달 닫힘
        >
          <div
            className="relative w-80 bg-white shadow-lg transform transition-transform duration-500 h-[calc(100%-4rem)] rounded-t-lg overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // 내부 클릭 시 모달 닫히지 않음
          >
            {/* ✖ 닫기 버튼 (상단 고정) */}
            <button
              onClick={() => setIsShopOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>
            <ItemShopPage />
          </div>
        </div>
      )}
      <div className="absolute bottom-0 w-full z-50">
        <BottomBar />
      </div>
    </div>
  );
};

export default MyGymPage;
