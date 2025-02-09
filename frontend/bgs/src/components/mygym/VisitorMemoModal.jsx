// VisitorMemoModal.jsx
import { useState, useEffect } from "react";
import { createGuestBooks, deleteGuestBook, getGuestBooks, updateGuestBook } from "../../api/Mygym";
import useUserStore from "../../stores/useUserStore";

const VisitorMemoModal = ({
  isOpen,
  onClose,
  visitorMemos,
  setVisitorMemos,
  userProfile,
  userId, // 마이짐 주인의 ID (URL에 사용)
}) => {
  const [newComment, setNewComment] = useState("");
  const { user } = useUserStore();
  const currentUserId = user.userId; // 현재 로그인한 사용자의 ID

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  // 새 방명록 추가
const handleAddComment = async () => {
  if (newComment.trim() === "") return;
  try {
    const payload = { content: newComment };
    // 새 방명록 생성 API 호출
    await createGuestBooks(userId, payload);
    
    // GET 요청으로 전체 목록을 다시 가져오기
    const updatedData = await getGuestBooks(userId);
    // 삭제되지 않은 항목만 필터링
    const freshMemos = updatedData.content.filter(memo => !memo.deleted);
    
    // 디버깅: GET 응답에 새로 추가한 방명록이 있는지 확인
    console.log("GET 응답 freshMemos:", freshMemos);
    
    // 만약 새로 추가한 방명록이 응답에 없다면, 임시 객체를 직접 추가
    if (!freshMemos.some(memo => memo.content === newComment)) {
      const newMemo = {
        // 임시 ID (실제 ID는 백엔드에서 부여되므로 이후 새로고침 시 업데이트됨)
        guestbookId: Date.now(),
        ownerId: userId,
        guestId: currentUserId,
        content: newComment,
        createdAt: new Date().toISOString(),
        deleted: false,
      };
      setVisitorMemos([...freshMemos, newMemo]);
    } else {
      setVisitorMemos(freshMemos);
    }
    
    setNewComment("");
    console.log(`새 방명록 추가됨: ${newComment}`);
  } catch (error) {
    console.error("방명록 추가에 실패했습니다:", error);
  }
};

  
  

  // 방명록 삭제 함수
  // 방명록 업데이트 (삭제 처리 전용 PATCH 호출)

  const handleDeleteMemo = async (guestbookId) => {
    try {
      await deleteGuestBook(userId, guestbookId);
      // 삭제 후, 현재 목록에서 해당 방명록 제거
      const updatedMemos = visitorMemos.filter(
        (memo) => memo.guestbookId !== guestbookId
      );
      setVisitorMemos(updatedMemos);
    } catch (error) {
      console.error("방명록 삭제에 실패했습니다:", error);
    }
  };


  return (
    <div
      className={`fixed inset-0 flex items-end justify-center z-50 transition-transform duration-500 
      ${isOpen ? "translate-y-0" : "translate-y-full"}`}
    >
      {/* 배경 클릭 시 닫힘 */}
      <div
        className="bg-transparent"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      ></div>

      <div className="w-full max-w-md bg-white rounded-t-3xl shadow-lg p-4 overflow-y-auto max-h-[70vh]">
        <button className="text-gray-500 text-center w-full" onClick={onClose}>
          ▼
        </button>

        {/* 입력 필드 및 등록 버튼 */}
        <div className="flex items-center space-x-3 p-3 border-b">
          <img
            src={userProfile || "https://via.placeholder.com/40"}
            alt="프로필"
            className="w-10 h-10 rounded-full"
          />
          <input
            type="text"
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="댓글 추가..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button onClick={handleAddComment} className="text-blue-500 font-bold">
            등록
          </button>
        </div>

        {/* 방명록 목록 표시 */}
        <div className="space-y-4 mt-4">
          {visitorMemos.map((memo) => (
            <div
              key={memo.guestbookId}
              className="flex items-center justify-between space-x-3 p-2 border-b"
            >
              <div className="flex items-start space-x-3">
                <img
                  src={userProfile}
                  alt="프로필"
                  className="w-10 h-10 rounded-full"
                />
                <p className="text-gray-800">{memo.content}</p>
              </div>
              {/* 현재 로그인한 사용자가 작성한 방명록이면 삭제 버튼 표시 */}
              {currentUserId === memo.guestId && (
                <button
                  onClick={() => handleDeleteMemo(memo.guestbookId)}
                  className="text-red-500 text-sm"
                >
                  삭제
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VisitorMemoModal;
