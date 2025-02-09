// VisitorMemo.jsx
import { useState, useEffect } from "react";
import VisitorMemoModal from "./VisitorMemoModal";
import { getGuestBooks, createGuestBooks } from "../../api/Mygym"; // 실제 API 함수 import
import useUserStore from "../../stores/useUserStore";
const VisitorMemo = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [visitorMemos, setVisitorMemos] = useState([]);

  // 컴포넌트가 마운트될 때 방명록 데이터를 가져옵니다.
  useEffect(() => {
    async function fetchGuestbooks() {
      try {
        const data = await getGuestBooks(userId);
        // API 응답 구조가 { content: [...] } 형태라면:
        setVisitorMemos(data.content);
      } catch (error) {
        console.error("방명록 데이터를 불러오는데 실패했습니다:", error);
      }
    }
    fetchGuestbooks();
  }, [userId]);

  // 최신 방명록을 표시 (목록이 비어있을 경우 대체 텍스트를 표시)
  const lastMemo = visitorMemos.length
    ? visitorMemos[visitorMemos.length - 1]
    : null;
  const userProfile = "https://via.placeholder.com/40"; // 프로필 이미지 (실제 데이터가 있다면 교체)

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
                src={userProfile}
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

      {/* 모달 컴포넌트에 현재 방명록 목록과 이를 업데이트하는 함수 전달 */}
      <VisitorMemoModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        visitorMemos={visitorMemos}
        setVisitorMemos={setVisitorMemos}
        userProfile={userProfile}
        userId={userId}
      />
    </>
  );
};

export default VisitorMemo;
