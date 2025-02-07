import { useState, useEffect } from "react";

const VisitorMemoModal = ({ isOpen, onClose, visitorMemos, userProfile }) => {
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  const handleAddComment = () => {
    if (newComment.trim() === "") return;
    alert(`새 방명록 추가: ${newComment}`);
    setNewComment("");
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
          if (e.target === e.currentTarget) onClose(); // 배경 부분만 클릭하면 닫힘
        }}
      ></div>

      {/* 모달 내용 */}
      <div className="w-full max-w-md bg-white rounded-t-3xl shadow-lg p-4 overflow-y-auto max-h-[70vh]">
        <button className="text-gray-500 text-center w-full" onClick={onClose}>
          ▼
        </button>

        {/* 입력 필드 + 프로필 이미지 */}
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

        {/* 방명록 리스트 */}
        <div className="space-y-4 mt-4">
          {visitorMemos.map((memo) => (
            <div key={memo.id} className="flex items-start space-x-3 p-2 border-b">
              <img src={memo.profileImage} alt="프로필" className="w-10 h-10 rounded-full" />
              <p className="text-gray-800">{memo.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VisitorMemoModal;
