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
    // 불필요한 필드를 제거 (예: createdAt, name, image)
    const newPlaces = obj.places.map((item) => {
      const { createdAt, name, image, ...rest } = item;
      return rest;
    });
    const newObj = { ...obj, places: newPlaces };
    await updateMygym(userId, newObj);
    setIsEditing(false);
  };

  // 방명록(댓글) 상태 관리
  const [visitorMemos, setVisitorMemos] = useState([]);
  const [totalCount, setTotalCount] = useState(0); // 삭제되지 않은 댓글 개수
  const [lastMemo, setLastMemo] = useState(null); // 전체 댓글 중 가장 오래된(아래쪽) 댓글
  const [lastMemoProfileUrl, setLastMemoProfileUrl] = useState(null);

  // MyGymPage가 마운트될 때, 유저 정보, 마이짐, 방명록 데이터를 불러옴
  useEffect(() => {
    async function enterMygymPage() {
      const response = await getUser();
      setUser(response);
      getMygym(response.userId).then((MyGym) => {
        setMyGym(MyGym);
      });
      try {
        // 첫 페이지의 댓글 (최신 순으로 10개씩)
        const data = await getGuestBooks(response.userId, 0, 10);
        const freshMemos = data.content.filter((memo) => !memo.deleted);
        setVisitorMemos(freshMemos);
        // 만약 backend의 totalElements가 삭제된 댓글을 포함한다면, 대신 freshMemos.length를 사용할 수 있습니다.
        setTotalCount(freshMemos.length);
        // 마지막(오래된) 댓글: 전체 댓글이 10개 이상이면, 마지막 페이지의 마지막 댓글을 사용
        if (data.totalPages > 1) {
          const lastPage = data.totalPages - 1;
          const lastData = await getGuestBooks(response.userId, lastPage, 10);
          if (lastData.content && lastData.content.length > 0) {
            const overallLastMemo = lastData.content[lastData.content.length - 1];
            setLastMemo(overallLastMemo);
          }
        } else {
          if (freshMemos.length > 0) {
            setLastMemo(freshMemos[freshMemos.length - 1]);
          }
        }
      } catch (error) {
        console.error("방명록 불러오기 실패:", error);
      }
    }
    enterMygymPage();
  }, [setUser, setMyGym]);

  // 마지막 댓글의 작성자 프로필 이미지 불러오기
  useEffect(() => {
    if (!lastMemo) {
      setLastMemoProfileUrl(null);
      return;
    }
    if (lastMemo.guestId) {
      getUser(lastMemo.guestId).then((res) => {
        setLastMemoProfileUrl(res.profileImageUrl || "https://via.placeholder.com/40");
      });
    }
  }, [lastMemo]);

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
      }}
    >
      <TopBar />

      <div className="flex justify-center items-center">
        <h1 className="text-2xl font-bold text-center py-2">
          {user.nickname} 마이짐
        </h1>
        {isEditing && (
          <div className="ml-4">
            <MyGymRoomBgColor setBgColor={setPageBgColor} />
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
            완료
          </button>
          <SelectColor setRoomColor={setWallColor} />
          <MyGymItem setItems={setItems} />
        </>
      ) : (
        // 보기 모드
        <>
          <MyGymRoomView userId={user.userId} />
          <button
            onClick={handleEditMode}
            className="bg-blue-400 text-white px-4 py-2 rounded-full"
          >
            편집
          </button>

          {/* 방명록 영역 - 항상 보임 */}

            <div className="mt-4 w-full bg-gray-100 p-3 rounded-3xl flex items-center justify-between">
              <CommentInput
                newComment={""} // 이 예시에서는 CommentInput 내부에서 자체 상태 관리하거나 필요에 따라 상태를 MyGymPage에서 관리하세요.
                setNewComment={() => {}}
                onAddComment={() => {}}
              />
              {/* 최신 댓글이 위에 오도록 reverse() 사용 */}
              {visitorMemos.slice().reverse().map((memo) => (
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
