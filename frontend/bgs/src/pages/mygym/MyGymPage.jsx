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
import effecticon from "../../assets/icons/effecticon.png";

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
import bgimg6 from "../../assets/images/backimg6.jpg";

// 가운데 모달로 띄우는 ItemShopModal
import ItemShopModal from "../../components/mygym/ItemShopModal";

const backgroundImages = {
  bgimg: backimg,
  bgimg1: bgimg1,
  bgimg2: bgimg2,
  bgimg3: bgimg3,
  bgimg4: bgimg4,
  bgimg5: bgimg5,
  bgimg6: bgimg6,
};

const MyGymPage = () => {
  const { user, setUser } = useUserStore();
  const { myGym, setMyGym, setWallColor, setItems } = useMyGymStore();

  // 모달 관련 상태
  const [isItemOpen, setIsItemOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isSelectBackImgOpen, setIsSelectBackImgOpen] = useState(false);
  const [isEffectModalOpen, setIsEffectModalOpen] = useState(false);

  // 배경 효과
  const [isBgMoving, setIsBgMoving] = useState(true);

  // 편집 모드
  const [isEditing, setIsEditing] = useState(false);

  // 방명록(댓글) 상태
  const [visitorMemos, setVisitorMemos] = useState([]);

  // 팔레트 아이콘 클릭 시
  const handlePaletteClick = () => {
    setIsItemOpen((prev) => !prev);
  };

  // 편집 모드 켜기
  const handleEditMode = () => {
    setIsEditing(true);
    setIsItemOpen(true);
  };

  // 편집 종료(저장)
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

  // 페이지 진입 시 유저와 마이짐 정보 로드
  useEffect(() => {
    async function enterMygymPage() {
      try {
        const response = await getUser();
        setUser(response);

        const MyGym = await getMygym(response.userId);
        setMyGym(MyGym);
        setIsBgMoving(MyGym.flowed);

        const data = await getGuestBooks(response.userId, 0, 10);
        const freshMemos = data.content.filter((memo) => !memo.deleted);
        setVisitorMemos(freshMemos);
      } catch (error) {
        console.error("마이짐 페이지 로딩 실패:", error);
      }
    }
    enterMygymPage();
  }, [setUser, setMyGym]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${backgroundImages[myGym.backgroundColor] || backimg
          })`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "repeat-x",
        animation: isBgMoving ? "moveBg 60s linear infinite" : "none",
        position: "relative",
      }}
    >
      {/* 상단 타이틀 */}
      <div className="flex justify-center items-center mb-5">
        <h1 className="text-3xl font-extrabold text-center py-2 drop-shadow-lg">
          {user.nickname} 마이짐
        </h1>
      </div>

      {/* 우측 상단 버튼들 */}
      <div className="absolute top-10 right-2 flex flex-col gap-3">
        {isEditing ? (
          <>
            {/* 편집 완료 버튼 */}
            <button
              onClick={handleFinishEdit}
              className="bg-primary px-4 py-2 rounded-full text-white w-14 h-10"
            >
              ✔
            </button>
            {/* 상점 열기 버튼 */}
            <button
              onClick={() => setIsShopOpen(true)}
              className="bg-white px-4 py-2 rounded-full shadow-md z-30"
            >
              <img src={shopicon} alt="상점" className="w-6 h-6" />
            </button>
          </>
        ) : (
          // 편집 모드 진입 버튼
          <button
            onClick={handleEditMode}
            className="bg-white px-4 py-2 rounded-full shadow-md"
          >
            <img src={editicon} alt="편집" className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* 편집 모드 / 보기 모드 구분 */}
      {isEditing ? (
        <>
          <MyGymRoomEdit />
          {/* 좌측 상단: 배경 선택 + 이펙트 버튼 */}
          <div className="absolute top-10 left-2 flex flex-col gap-3">
            <button
              onClick={() => setIsSelectBackImgOpen(true)}
              className="bg-white px-2 py-2 z-30 flex items-center justify-center rounded-xl shadow-md w-14 h-10"
            >
              <div
                className="w-6 h-6 rounded"
                style={{
                  backgroundImage: `url(${backgroundImages[myGym.backgroundColor] || backimg
                    })`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            </button>
            <button
              onClick={() => setIsEffectModalOpen(true)}
              className="bg-white px-2 py-2 z-30 flex items-center justify-center rounded-xl shadow-md w-14 h-10"
            >
              <img src={effecticon} alt="effect icon" className="w-7 h-7" />
            </button>
          </div>
          <SelectColor
            setRoomColor={setWallColor}
            onClick={handlePaletteClick}
          />
          <MyGymItem setItems={setItems} forceOpen={isItemOpen} />
        </>
      ) : (
        <>
          <MyGymRoomView userId={user.userId} />
          <div className="mt-10" style={{ paddingBottom: "10px" }}>
            <MyGymViewVisitorMemo
              userId={user.userId}
              visitorMemos={visitorMemos}
              setVisitorMemos={setVisitorMemos}
            />
          </div>
        </>
      )}

      {/* 상점 모달 (오른쪽 슬라이드 대신, 중앙 모달로 단순히 띄움) */}
      {isShopOpen && <ItemShopModal onClose={() => setIsShopOpen(false)} />}

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

      {/* 이펙트 모달 */}
      {isEffectModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 flex justify-center items-center"
          onClick={() => setIsEffectModalOpen(false)}
        >
          <div
            className="relative w-80 bg-white shadow-lg rounded-lg overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsEffectModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>
            <div className="p-4">
              <h2 className="text-xl mb-4 text-center">배경 효과</h2>
              <div className="flex justify-center gap-10">
                {/* 움직이는 배경 미리보기 */}
                <div
                  onClick={() => {
                    setIsBgMoving(true);
                    setMyGym({ ...myGym, flowed: true });
                    setIsEffectModalOpen(false);
                  }}
                  className="cursor-pointer border p-2 rounded-md"
                >
                  <p className="text-center">움직임</p>
                  <div className="w-20 h-20 border mt-2 overflow-hidden relative rounded-xl">
                    <div
                      className="absolute top-0 left-0 w-full h-full"
                      style={{
                        backgroundImage: `url(${backgroundImages[myGym.backgroundColor] || backimg
                          })`,
                        backgroundSize: "cover",
                        animation: "moveBg 30s linear infinite",
                      }}
                    ></div>
                  </div>
                </div>
                {/* 고정된 배경 미리보기 */}
                <div
                  onClick={() => {
                    setIsBgMoving(false);
                    setMyGym({ ...myGym, flowed: false });
                    setIsEffectModalOpen(false);
                  }}
                  className="cursor-pointer border p-2 rounded-md"
                >
                  <p className="text-center">없음</p>
                  <div className="w-20 h-20 border mt-2 overflow-hidden rounded-xl">
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: `url(${backgroundImages[myGym.backgroundColor] || backimg
                          })`,
                        backgroundSize: "cover",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 바텀바 */}
      <div className="absolute bottom-0 w-full z-50">
        <BottomBar />
      </div>
    </div>
  );
};

export default MyGymPage;
