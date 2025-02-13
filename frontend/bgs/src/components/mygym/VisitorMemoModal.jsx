// src/components/mygym/VisitorMemoModal.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createGuestBooks, deleteGuestBook, getGuestBooks, updateGuestBook } from "../../api/Mygym";
import CommentInput from "./CommentInput";
import CommentList from "./CommentList";

const VisitorMemoModal = ({ isOpen, onClose, visitorMemos, setVisitorMemos, userId }) => {
  const [newComment, setNewComment] = useState("");
  const navigate = useNavigate();

  // 댓글 수정 상태 관리
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  // 페이징 상태 관리
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  // 페이지 번호에 따른 댓글 로드 함수
  const loadComments = useCallback(async (page = 0) => {
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
  }, [userId, setVisitorMemos]);

  // 모달이 열릴 때 첫 페이지 댓글 로드
  useEffect(() => {
    if (isOpen) {
      loadComments(0);
    }
  }, [isOpen, loadComments]);

  // 새 댓글 추가 핸들러
  const handleAddComment = useCallback(async () => {
    if (newComment.trim() === "") return;
    try {
      const payload = { content: newComment };
      await createGuestBooks(userId, payload);
      // 댓글 추가 후 첫 페이지를 다시 로드하여 최신 댓글 확인
      loadComments(0);
      setNewComment("");
    } catch (error) {
      console.error("댓글 추가 실패:", error);
    }
  }, [newComment, userId, loadComments]);

  // 댓글 삭제 핸들러
  const handleDeleteMemo = useCallback(async (guestbookId) => {
    try {
      await deleteGuestBook(userId, guestbookId);
      // 삭제 후 첫 페이지 다시 로드
      loadComments(0);
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
    }
  }, [userId, loadComments]);

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
  const handleSaveEditing = useCallback(async (guestbookId) => {
    try {
      const payload = { content: editingContent };
      await updateGuestBook(userId, guestbookId, payload);
      // 수정 후 첫 페이지 다시 로드
      loadComments(0);
      setEditingCommentId(null);
      setEditingContent("");
    } catch (error) {
      console.error("댓글 수정 실패:", error);
    }
  }, [editingContent, userId, loadComments]);

  // 더보기 버튼 핸들러
  const handleLoadMore = async () => {
    if (currentPage < totalPages - 1) {
      await loadComments(currentPage + 1);
    }
  };

  return (
    <div className={`fixed inset-0 flex items-end justify-center z-50 transition-transform duration-500 ${isOpen ? "translate-y-0" : "translate-y-full"}`}>
      <div className="bg-transparent" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}></div>
      <div className="w-full max-w-md bg-white rounded-t-3xl shadow-lg p-4 overflow-y-auto max-h-[70vh]">
        <button className="text-gray-500 text-center w-full" onClick={onClose}>▼</button>
        {/* 댓글 입력 컴포넌트 */}
        <CommentInput newComment={newComment} setNewComment={setNewComment} onAddComment={handleAddComment} />
        {/* 댓글 목록 */}
        <div className="space-y-4 mt-4">
          {visitorMemos.map((memo) => (
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
          ))}
        </div>
        {/* 더보기 버튼 (마지막 페이지가 아닐 경우) */}
        {currentPage < totalPages - 1 && (
          <div className="flex justify-center mt-4">
            <button onClick={handleLoadMore} className="px-4 py-2 bg-gray-200 rounded-full">
              더보기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitorMemoModal;
