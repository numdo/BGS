// src/pages/MyGymPage.jsx
import { useState, useEffect } from "react";
import BottomBar from "../../components/bar/BottomBar";
import MyGymRoomEdit from "../../components/mygym/MyGymRoomEdit";
import MyGymRoomView from "../../components/mygym/MyGymRoomView";
import MyGymItem from "../../components/mygym/MyGymItem";
import SelectColor from "../../components/mygym/SelectColor";
import MyGymViewVisitorMemo from "../../components/mygym/MyGymViewVisitorMemo";
import SelectBackImg from "../../components/mygym/SelectBackImg";
import "../../style.css";
import editicon from "../../assets/icons/editicon.png";
import shopicon from "../../assets/icons/shopicon.png";

import useUserStore from "../../stores/useUserStore";
import useMyGymStore from "../../stores/useMyGymStore";
import { getMygym, updateMygym, getGuestBooks } from "../../api/Mygym";
import { getUser } from "../../api/User";

import backimg from "../../assets/images/backimg.png";
import bgimg1 from "../../assets/images/backimg1.jpg";
import bgimg2 from "../../assets/images/backimg2.jpg";
import bgimg3 from "../../assets/images/backimg3.jpg";
import bgimg4 from "../../assets/images/backimg4.jpg";
import bgimg5 from "../../assets/images/backimg5.jpg";

const backgroundImages = {
  bgimg: backimg,
  bgimg1: bgimg1,
  bgimg2: bgimg2,
  bgimg3: bgimg3,
  bgimg4: bgimg4,
  bgimg5: bgimg5,
};

import ItemShopPage from "./ItemShopPage";

const MyGymPage = () => {
  // 유저 정보 및 마이짐 상태
  const { user, setUser } = useUserStore();
  const { myGym, setMyGym, setWallColor, setItems } = useMyGymStore();

  // 모달 관련 상태
  const [isOpen, setIsOpen] = useState(true);
  const [isItemOpen, setIsItemOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isSelectBackImgOpen, setIsSelectBackImgOpen] = useState(false); // 배경 선택 모달 상태

  // 편집 모드 상태
  const [isEditing, setIsEditing] = useState(false);

  // 방명록(댓글) 상태
  const [visitorMemos, setVisitorMemos] = useState([]);

  // 버튼 클릭 핸들러들
  const handlePaletteClick = () => {
    setIsItemOpen((prev) => !prev);
  };

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

  useEffect(() => {
    async function enterMygymPage() {
      const response = await getUser();
      setUser(response);
      getMygym(response.userId).then((MyGym) => {
        setMyGym(MyGym);
      });
      try {
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
        minHeight: "100vh",
        backgroundImage: `url(${backgroundImages[myGym.backgroundColor] || backimg})`,
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

      {/* 상단 우측 버튼들 */}
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
            className="bg-white px-4 py-2 rounded-full shadow-md"
          >
            <img src={editicon} alt="편집" className="w-6 h-6" />
          </button>
        )}
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
          {/* 배경 선택 버튼*/}
      <div className="absolute top-10 left-2 flex flex-col gap-3">
        <button
          onClick={() => setIsSelectBackImgOpen(true)}
          className="bg-white px-2 py-2 z-30 flex items-center justify-center rounded-xl shadow-md w-14 h-10"
        >
          <div
            className="w-6 h-6 rounded"
            style={{
              backgroundImage: `url(${backgroundImages[myGym.backgroundColor] || backimg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </button>
      </div>
          <SelectColor setRoomColor={setWallColor} onClick={handlePaletteClick} />
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

      {/* 상점 */}
      {isShopOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 flex justify-end"
          onClick={() => setIsShopOpen(false)}
        >
          <div
            className="relative w-80 bg-white shadow-lg transform transition-transform duration-500 h-[calc(100%-4rem)] rounded-t-lg overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
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

      {/* 배경 선택 모달 */}
      {isSelectBackImgOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 flex justify-center items-center"
          onClick={() => setIsSelectBackImgOpen(false)}
        >
          <div
            className="relative w-80 bg-white shadow-lg rounded-lg overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsSelectBackImgOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>
            <SelectBackImg />
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
