// src/components/mygym/MyGymViewVisitorMemo.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CommentInput from "./CommentInput";
import CommentList from "./CommentList";
import {
  createGuestBooks,
  deleteGuestBook,
  getGuestBooks,
  updateGuestBook,
} from "../../api/Mygym";
import memo from "../../assets/images/memo.png";
import BeatLoader from "../../components/common/LoadingSpinner";

const MyGymViewVisitorMemo = ({ userId }) => {
  const [newComment, setNewComment] = useState("");
  const [notification, setNotification] = useState(""); // 알림 상태
  const [visitorMemos, setVisitorMemos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 댓글 수정 상태 관리
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  // 페이징 상태 관리
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // 페이지 번호에 따른 댓글 로드 함수
  const loadComments = useCallback(
    async (page = 0) => {
      setIsLoading(true);
      try {
        const data = await getGuestBooks(userId, page, 10); // 10개씩 불러옴
        const freshMemos = data.content.filter((memo) => !memo.deleted);
        if (page === 0) {
          setVisitorMemos(freshMemos);
        } else {
          setVisitorMemos((prev) => [...prev, ...freshMemos]);
        }
        setCurrentPage(data.number);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("댓글 불러오기 실패:", error);
      }
      setIsLoading(false);
    },
    [userId, setVisitorMemos]
  );

  useEffect(() => {
    loadComments(0);
  }, [loadComments]);

  // 새 댓글 추가 핸들러
  const handleAddComment = useCallback(async () => {
    if (newComment.trim() === "") return;
    try {
      const payload = { content: newComment };
      await createGuestBooks(userId, payload);
      loadComments(0); // 댓글 추가 후 첫 페이지를 다시 로드하여 최신 댓글 확인
      setNewComment("");
    } catch (error) {
      console.error("댓글 추가 실패:", error);
    }
  }, [newComment, userId, loadComments]);

  // 댓글 삭제 핸들러 (삭제 시 알림 표시)
  const handleDeleteMemo = useCallback(
    async (guestbookId) => {
      try {
        await deleteGuestBook(userId, guestbookId);
        setNotification("댓글이 삭제되었습니다.");
        loadComments(0);
        setTimeout(() => setNotification(""), 3000);
      } catch (error) {
        console.error("댓글 삭제 실패:", error);
      }
    },
    [userId, loadComments]
  );

  // 댓글 수정 시작 핸들러
  const handleStartEditing = useCallback((memo) => {
    setEditingCommentId(memo.guestbookId);
    setEditingContent(memo.content);
  }, []);

  // 댓글 수정 취소 핸들러
  const handleCancelEditing = useCallback(() => {
    setEditingCommentId(null);
    setEditingContent("");
  }, []);

  // 댓글 수정 저장 핸들러
  const handleSaveEditing = useCallback(
    async (guestbookId) => {
      try {
        const payload = { content: editingContent };
        await updateGuestBook(userId, guestbookId, payload);
        loadComments(0);
        setEditingCommentId(null);
        setEditingContent("");
      } catch (error) {
        console.error("댓글 수정 실패:", error);
      }
    },
    [editingContent, userId, loadComments]
  );

  return (
    <>
      {/* ✅ 로딩 화면 */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-[99999]">
          <BeatLoader size={15} color="#ffffff" />
        </div>
      )}
      <div
        className="bg-white py-2 px-2 mx-4 mb-16 shadow-md rounded-3xl min-h-[calc(50vh-120px)]"
        style={{
          // backgroundImage: `url(${memo})`,
          // backgroundRepeat:"no-repeat",
          // backgroundSize:'cover',
          zIndex: 3,
        }}
      >
        <CommentInput
          newComment={newComment}
          setNewComment={setNewComment}
          onAddComment={handleAddComment}
        />

        {/* 알림 문구 */}
        {notification && (
          <div className="text-center text-green-600 py-2">{notification}</div>
        )}

        <div className="mt-4 max-h-[200px] overflow-y-auto">
          {visitorMemos?.length === 0 ? (
            <div className="text-center text-gray-500 mt-4">
              아직 작성된 방명록이 없습니다.
              <br />
              방명록을 작성하여 친구에게 인사해보세요!
            </div>
          ) : (
            visitorMemos
              .slice()
              .reverse()
              .map((memo) => (
                <CommentList
                  key={memo.guestbookId}
                  memo={memo}
                  editingCommentId={editingCommentId}
                  editingContent={editingContent}
                  setEditingContent={setEditingContent}
                  onStartEditing={handleStartEditing}
                  onCancelEditing={handleCancelEditing}
                  onSaveEditing={handleSaveEditing}
                  onDeleteMemo={handleDeleteMemo}
                />
              ))
          )}
        </div>
      </div>
    </>
  );
};

export default MyGymViewVisitorMemo;
