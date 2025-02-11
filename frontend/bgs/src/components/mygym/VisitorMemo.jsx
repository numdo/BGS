// VisitorMemo.jsx
import { useState, useEffect } from "react";
import VisitorMemoModal from "./VisitorMemoModal";
import { getGuestBooks } from "../../api/Mygym";
import { getUser } from "../../api/User";
import myinfo from "../../assets/icons/myinfo.png";

const VisitorMemo = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [visitorMemos, setVisitorMemos] = useState([]);
  const [lastMemoProfileUrl, setLastMemoProfileUrl] = useState(null);

  // 방명록 불러오기
  useEffect(() => {
    async function fetchGuestbooks() {
      try {
        const data = await getGuestBooks(userId);
        // 삭제되지 않은 방명록만 필터링해서 저장
        setVisitorMemos(data.content.filter((memo) => !memo.deleted));
      } catch (error) {
        console.error("방명록 데이터를 불러오는데 실패했습니다:", error);
      }
    }
    fetchGuestbooks();
  }, [userId]);

  // 가장 최근 방명록
  const lastMemo = visitorMemos.length
    ? visitorMemos[visitorMemos.length - 1]
    : null;

  // 최근 방명록 작성자 프로필 불러오기
  useEffect(() => {
    if (!lastMemo) {
      // 방명록이 아예 없으면 null 처리
      setLastMemoProfileUrl(null);
      return;
    }
    if (lastMemo.guestId) {
      // 작성자 ID가 있으면 해당 프로필 요청
      getUser(lastMemo.guestId).then((res) => {
        // 백엔드 응답에서 실제 필드명 확인: res.profileImageUrl?
        setLastMemoProfileUrl(res.profileImageUrl || null);
      });
    }
  }, [lastMemo]); // lastMemo가 바뀔 때만 실행

  return (
    <>
      <div
        className="w-full bg-gray-100 p-3 rounded-3xl flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center">
          {lastMemo ? (
            <>
              <img
                src={lastMemoProfileUrl || myinfo}
                alt="프로필"
                className="w-8 h-8 rounded-full mr-3"
              />
              <p className="text-gray-700 text-sm">{lastMemo.content}</p>
            </>
          ) : (
            <p className="text-gray-700 text-sm">
              아직 방명록이 없어요. 첫 방명록을 남겨주세요!
            </p>
          )}
        </div>
        <p className="text-blue-500 font-bold">방명록 {visitorMemos.length}</p>
      </div>

      {/* 모달 컴포넌트 */}
      <VisitorMemoModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        visitorMemos={visitorMemos}
        setVisitorMemos={setVisitorMemos}
        userId={userId}
      />
    </>
  );
};

export default VisitorMemo;
