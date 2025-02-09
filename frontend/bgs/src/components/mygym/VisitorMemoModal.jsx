// VisitorMemoModal.jsx
import { useState, useEffect } from "react";
import { getGuestBooks,createGuestBooks } from "../../api/Mygym"; // 실제 API 함수 import

const VisitorMemoModal = ({
  isOpen,
  onClose,
  visitorMemos,
  setVisitorMemos,
  userProfile,
  userId,
}) => {
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  const handleAddComment = async () => {
    if (newComment.trim() === "") return;
    try {
      const payload = { content: newComment };
      // 새 방명록 생성 API 호출
      await createGuestBooks(userId, payload);
      // 새 방명록 추가 후 전체 방명록 목록을 다시 가져옴
      const updatedData = await getGuestBooks(userId);
      setVisitorMemos(updatedData.content);
      setNewComment("");
    } catch (error) {
      console.error("방명록 추가에 실패했습니다:", error);
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
            <div key={memo.guestbookId} className="flex items-start space-x-3 p-2 border-b">
              <img
                src={userProfile}
                alt="프로필"
                className="w-10 h-10 rounded-full"
              />
              <p className="text-gray-800">{memo.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VisitorMemoModal;
