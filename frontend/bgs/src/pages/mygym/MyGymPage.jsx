// src/pages/MyGymPage.jsx
import { useState, useEffect } from "react";
import TopBar from "../../components/bar/TopBar";
import BottomBar from "../../components/bar/BottomBar";
import MyGymRoomEdit from "../../components/mygym/MyGymRoomEdit";
import MyGymRoomView from "../../components/mygym/MyGymRoomView";
import MyGymItem from "../../components/mygym/MyGymItem";
import SelectColor from "../../components/mygym/SelectColor";
import MyGymRoomBgColor from "../../components/mygym/MyGymRoomBgColor";
import CommentInput from "../../components/mygym/CommentInput";
import CommentList from "../../components/mygym/CommentList";
import "../../style.css";

import useUserStore from "../../stores/useUserStore";
import useMyGymStore from "../../stores/useMyGymStore";
import { getMygym, updateMygym, getGuestBooks } from "../../api/Mygym";
import { getUser } from "../../api/User";

import mygymbackimg from "../../assets/images/mygymbackimg.png";

const MyGymPage = () => {
  // 유저 정보 및 마이짐 상태
  const { user, setUser } = useUserStore();
  const { myGym, setMyGym, pageBgColor, setPageBgColor, setWallColor, setItems } = useMyGymStore();

  // 편집 모드 여부
  const [isEditing, setIsEditing] = useState(false);
  const handleEditMode = () => setIsEditing(true);
  const handleFinishEdit = async () => {
    const { nickname, userId, ...obj } = myGym;
    const newPlaces = obj.places.map((item) => {
      const { createdAt, name, image, ...rest } = item;
      return rest;
    });
    const newObj = { ...obj, places: newPlaces };
    await updateMygym(userId, newObj);
    setIsEditing(false);
  };

  // 방명록(댓글) 상태 관리 (예시)
  const [visitorMemos, setVisitorMemos] = useState([]);
  const [newComment, setNewComment] = useState("");

  // MyGymPage가 마운트될 때 유저 정보, 마이짐, 방명록 데이터를 불러옴
  useEffect(() => {
    async function enterMygymPage() {
      const response = await getUser();
      setUser(response);
      getMygym(response.userId).then((MyGym) => {
        setMyGym(MyGym);
      });
      try {
        // 최신 댓글 10개를 불러옴 (API에서 최신순으로 정렬되어 있다고 가정)
        const data = await getGuestBooks(response.userId, 0, 10);
        const freshMemos = data.content.filter((memo) => !memo.deleted);
        setVisitorMemos(freshMemos);
      } catch (error) {
        console.error("방명록 불러오기 실패:", error);
      }
    }
    enterMygymPage();
  }, [setUser, setMyGym]);

  // 새 댓글 추가 핸들러 (예시; 실제 API 호출이 있다면 해당 로직 추가)
  const handleAddComment = async () => {
    if (newComment.trim() === "") return;
    try {
      // 예시: 새 댓글을 API로 추가한 후 최신 댓글 배열을 불러오거나
      // 임시로 상태 업데이트
      const newMemo = {
        guestbookId: Date.now(), // 임시 ID
        guestId: user.userId,
        content: newComment,
        createdAt: new Date().toISOString(),
        deleted: false,
      };
      // 최신 댓글이 위쪽에 표시되도록 배열의 앞에 추가
      setVisitorMemos([newMemo, ...visitorMemos]);
      setNewComment("");
    } catch (error) {
      console.error("댓글 추가 실패:", error);
    }
  };

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
        position: "relative", // 하위의 absolute 요소를 위한 설정
      }}
    >
      <TopBar />

      <div className="flex justify-center items-center">
        <h1 className="text-3xl font-extrabold text-center py-2  drop-shadow-lg bg-blue-300 w-80 rounded-xl">
          {user.nickname} 마이짐
        </h1>
        {isEditing && (
          <div className="ml-4">
            <MyGymRoomBgColor setBgColor={setPageBgColor} />
          </div>
        )}
      </div>


      <div className="absolute top-2 right-2">
        {isEditing ? (
          <button
            onClick={handleFinishEdit}
            className="bg-green-500 px-4 py-2 rounded-full text-white"
          >
            완료
          </button>
        ) : (
          <button
            onClick={handleEditMode}
            className="bg-blue-400 text-white px-4 py-2 rounded-full"
          >
            편집
          </button>
        )}
      </div>

      {isEditing ? (
        // 편집 모드
        <>
          <MyGymRoomEdit />
          <SelectColor setRoomColor={setWallColor} />
          <MyGymItem setItems={setItems} />
        </>
      ) : (
        // 보기 모드
        <>
          <MyGymRoomView userId={user.userId} />
          {/* 댓글 영역: 항상 보이도록 */}
          <div className="mt-4 w-full bg-gray-100 p-3 rounded-3xl">
            <CommentInput
              newComment={newComment}
              setNewComment={setNewComment}
              onAddComment={handleAddComment}
            />
            {visitorMemos.map((memo) => (
              <CommentList key={memo.guestbookId} memo={memo} />
            ))}
          </div>
        </>
      )}

      <BottomBar />
    </div>
  );
};

export default MyGymPage;
