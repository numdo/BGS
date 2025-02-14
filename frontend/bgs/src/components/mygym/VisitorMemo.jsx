// src/components/mygym/VisitorMemo.jsx
import { useState, useEffect } from "react";
import VisitorMemoModal from "./VisitorMemoModal";
import { getGuestBooks } from "../../api/Mygym";
import { getUser } from "../../api/User";
import myinfo from "../../assets/icons/myinfo.png";

const VisitorMemo = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [visitorMemos, setVisitorMemos] = useState([]);
  const [totalCount, setTotalCount] = useState(0); // 전체 방명록 개수
  const [lastMemo, setLastMemo] = useState(null); // 전체에서 가장 오래된(마지막) 댓글
  const [lastMemoProfileUrl, setLastMemoProfileUrl] = useState(null);

  useEffect(() => {
    async function fetchGuestbooks() {
      try {
        // 첫 페이지(최신 댓글) 불러오기
        const data = await getGuestBooks(userId, 0, 10);
        const freshMemos = data.content.filter((memo) => !memo.deleted);
        setVisitorMemos(freshMemos);
        setTotalCount(data.totalElements);

        // 전체 댓글이 10개를 초과하면, 마지막 페이지의 댓글을 불러옴
        if (data.totalPages > 1) {
          const lastPage = data.totalPages - 1; // 프론트엔드에서 0부터 시작하는 page를 전달하면 실제 요청은 (page+1)
          const lastData = await getGuestBooks(userId, lastPage, 10);
          if (lastData.content && lastData.content.length > 0) {
            // 마지막 페이지의 마지막 댓글이 전체에서 가장 오래된 댓글
            const overallLastMemo = lastData.content[lastData.content.length - 1];
            setLastMemo(overallLastMemo);
          }
        } else {
          // 전체 댓글이 10개 이하이면, 첫 페이지의 마지막 댓글이 전체 마지막 댓글
          if (freshMemos.length > 0) {
            setLastMemo(freshMemos[freshMemos.length - 1]);
          }
        }
      } catch (error) {
        console.error("방명록 데이터를 불러오는데 실패했습니다:", error);
      }
    }
    fetchGuestbooks();
  }, [userId]);

  // 최근(미리보기용) 마지막 댓글 작성자 프로필 불러오기
  useEffect(() => {
    if (!lastMemo) {
      setLastMemoProfileUrl(null);
      return;
    }
    if (lastMemo.guestId) {
      getUser(lastMemo.guestId).then((res) => {
        setLastMemoProfileUrl(res.profileImageUrl || null);
      });
    }
  }, [lastMemo]);

  return (
    <>
      <div
        className="bg-gray-100 p-3 rounded-3xl flex items-center justify-between cursor-pointer"
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
        <p className="text-blue-500 font-bold">방명록 {totalCount}개</p>
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
