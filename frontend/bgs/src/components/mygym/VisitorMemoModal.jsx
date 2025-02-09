import { useState, useEffect } from "react";
import { 
  createGuestBooks, 
  deleteGuestBook, 
  getGuestBooks, 
  updateGuestBook 
} from "../../api/Mygym";
import useUserStore from "../../stores/useUserStore";

const VisitorMemoModal = ({
  isOpen,
  onClose,
  visitorMemos,
  setVisitorMemos,
  userId, // 마이짐 주인의 ID (URL에 사용)
}) => {
  const [newComment, setNewComment] = useState("");
  const { user } = useUserStore();
  const currentUserId = user.userId; // 현재 로그인한 사용자의 ID

  // 편집 상태 관련 상태값
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  // 새 댓글 추가 함수
  const handleAddComment = async () => {
    if (newComment.trim() === "") return;
    try {
      const payload = { content: newComment };
      // 새 댓글 생성 API 호출
      await createGuestBooks(userId, payload);
      
      // GET 요청으로 전체 목록 다시 가져오기
      const updatedData = await getGuestBooks(userId);
      const freshMemos = updatedData.content.filter(memo => !memo.deleted);
      
      console.log("GET 응답 freshMemos:", freshMemos);
      
      // 만약 새 댓글이 응답에 없다면, 임시 객체를 추가 (백엔드 응답이 늦을 경우 대비)
      if (!freshMemos.some(memo => memo.content === newComment)) {
        const newMemo = {
          guestbookId: Date.now(), // 임시 ID
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
      console.log(`새 댓글 추가됨: ${newComment}`);
    } catch (error) {
      console.error("댓글 추가에 실패했습니다:", error);
    }
  };

  // 댓글 삭제 함수 (DELETE 엔드포인트 사용)
  const handleDeleteMemo = async (guestbookId) => {
    try {
      await deleteGuestBook(userId, guestbookId);
      // 삭제 후 state 업데이트
      const updatedMemos = visitorMemos.filter(
        (memo) => memo.guestbookId !== guestbookId
      );
      setVisitorMemos(updatedMemos);
    } catch (error) {
      console.error("댓글 삭제에 실패했습니다:", error);
    }
  };

  // 댓글 수정 시작
  const handleStartEditing = (memo) => {
    setEditingCommentId(memo.guestbookId);
    setEditingContent(memo.content);
  };

  // 댓글 수정 취소
  const handleCancelEditing = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  // 댓글 수정 저장 (PATCH 요청)
  const handleSaveEditing = async (guestbookId) => {
    try {
      const payload = { content: editingContent };
      await updateGuestBook(userId, guestbookId, payload);
      // 수정된 내용을 state에 반영
      const updatedMemos = visitorMemos.map(memo => {
        if (memo.guestbookId === guestbookId) {
          return { ...memo, content: editingContent };
        }
        return memo;
      });
      setVisitorMemos(updatedMemos);
      setEditingCommentId(null);
      setEditingContent("");
    } catch (error) {
      console.error("댓글 수정에 실패했습니다:", error);
    }
  };

  // 작성자 프로필 이미지 및 이름 반환 함수
  const getProfileImage = (guestId) => {
    if (guestId === currentUserId && user.profileImageUrl) {
      return user.profileImageUrl;
    }
    return "https://via.placeholder.com/40"; // 다른 사용자는 기본 이미지
  };

  const getWriterName = (guestId) => {
    if (guestId === currentUserId && user.nickname) {
      return user.nickname;
    }
    return "익명"; // 다른 사용자는 익명 처리 (필요 시 별도 API 호출 고려)
  };

  return (
    <div
      className={`fixed inset-0 flex items-end justify-center z-50 transition-transform duration-500 
      ${isOpen ? "translate-y-0" : "translate-y-full"}`}
    >
      {/* 배경 클릭 시 모달 닫기 */}
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

        {/* 댓글 입력 필드 */}
        <div className="flex items-center space-x-3 p-3 border-b">
          <img
            src={getProfileImage(currentUserId)}
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

        {/* 댓글 목록 */}
        <div className="space-y-4 mt-4">
          {visitorMemos.map((memo) => (
            <div
              key={memo.guestbookId}
              className="flex items-center justify-between space-x-3 p-2 border-b"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={getProfileImage(memo.guestId)}
                  alt="프로필"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="text-sm font-bold">{getWriterName(memo.guestId)}</div>
                  {editingCommentId === memo.guestbookId ? (
                    <input
                      type="text"
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="border p-1 rounded"
                    />
                  ) : (
                    <p className="text-gray-800">{memo.content}</p>
                  )}
                </div>
              </div>
              {/* 현재 로그인 사용자가 작성한 댓글이면 수정 및 삭제 버튼 표시 */}
              {currentUserId === memo.guestId && (
                <div className="flex space-x-2">
                  {editingCommentId === memo.guestbookId ? (
                    <>
                      <button
                        onClick={() => handleSaveEditing(memo.guestbookId)}
                        className="text-green-500 text-sm"
                      >
                        저장
                      </button>
                      <button
                        onClick={handleCancelEditing}
                        className="text-gray-500 text-sm"
                      >
                        취소
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStartEditing(memo)}
                        className="text-blue-500 text-sm"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteMemo(memo.guestbookId)}
                        className="text-red-500 text-sm"
                      >
                        삭제
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VisitorMemoModal;
