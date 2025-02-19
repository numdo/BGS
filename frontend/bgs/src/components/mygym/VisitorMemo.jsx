// src/components/mygym/VisitorMemo.jsx
import { useState, useEffect } from "react";
import VisitorMemoModal from "./VisitorMemoModal";
import { getGuestBooks } from "../../api/Mygym";
import { getUser } from "../../api/User";
import myinfo from "../../assets/icons/myinfo.png";

const VisitorMemo = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [visitorMemos, setVisitorMemos] = useState([]);
  const [totalCount, setTotalCount] = useState(0); // 삭제되지 않은 방명록 개수
  const [lastMemo, setLastMemo] = useState(null); // 전체에서 가장 오래된(마지막) 댓글
  const [lastMemoProfileUrl, setLastMemoProfileUrl] = useState(null);

  useEffect(() => {
    async function fetchGuestbooks() {
      try {
        // 첫 페이지(최신 댓글) 불러오기
        const data = await getGuestBooks(userId, 0, 10);
        const freshMemos = data.content.filter((memo) => !memo.deleted);
        setVisitorMemos(freshMemos);

        // 전체 삭제되지 않은 댓글 개수를 계산
        let nonDeletedCount = freshMemos.length;
        if (data.totalPages > 1) {
          // 첫 페이지 외 나머지 페이지들도 조회
          for (let page = 1; page < data.totalPages; page++) {
            const pageData = await getGuestBooks(userId, page, 10);
            nonDeletedCount += pageData.content.filter(
              (memo) => !memo.deleted
            ).length;
          }
        }
        setTotalCount(nonDeletedCount);

        // 전체 댓글이 10개 이상이면, 마지막 페이지의 댓글 중 삭제되지 않은 마지막 댓글을 가져옴
        if (data.totalPages > 1) {
          const lastPage = data.totalPages - 1;
          const lastData = await getGuestBooks(userId, lastPage, 10);
          const freshLastPage = lastData.content.filter(
            (memo) => !memo.deleted
          );
          if (freshLastPage.length > 0) {
            setLastMemo(freshLastPage[freshLastPage.length - 1]);
          }
        } else {
          // 전체 댓글이 10개 이하인 경우
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

        {/* ✅ totalCount가 1 이하이면 안보이게, 99 이상이면 "+99"로 고정 */}
        {totalCount > 1 && (
          <p className="text-blue-500 font-bold">
            +{totalCount > 99 ? 99 : totalCount - 1}
          </p>
        )}
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
