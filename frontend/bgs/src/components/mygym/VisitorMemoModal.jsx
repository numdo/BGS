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

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  // 새 댓글 추가 핸들러
  const handleAddComment = useCallback(async () => {
    if (newComment.trim() === "") return;
    try {
      const payload = { content: newComment };
      await createGuestBooks(userId, payload);
      const updatedData = await getGuestBooks(userId);
      const freshMemos = updatedData.content.filter((memo) => !memo.deleted);
      setVisitorMemos(freshMemos);
      setNewComment("");
    } catch (error) {
      console.error("댓글 추가 실패:", error);
    }
  }, [newComment, userId, setVisitorMemos]);

  // 댓글 삭제 핸들러
  const handleDeleteMemo = useCallback(async (guestbookId) => {
    try {
      await deleteGuestBook(userId, guestbookId);
      const updatedMemos = visitorMemos.filter((memo) => memo.guestbookId !== guestbookId);
      setVisitorMemos(updatedMemos);
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
    }
  }, [userId, visitorMemos, setVisitorMemos]);

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
      const updatedMemos = visitorMemos.map((memo) =>
        memo.guestbookId === guestbookId ? { ...memo, content: editingContent } : memo
      );
      setVisitorMemos(updatedMemos);
      setEditingCommentId(null);
      setEditingContent("");
    } catch (error) {
      console.error("댓글 수정 실패:", error);
    }
  }, [editingContent, userId, visitorMemos, setVisitorMemos]);

  return (
    <div
      className={`fixed inset-0 flex items-end justify-center z-50 transition-transform duration-500 ${isOpen ? "translate-y-0" : "translate-y-full"}`}
    >
      <div
        className="bg-transparent"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      ></div>
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
      </div>
    </div>
  );
};

export default VisitorMemoModal;
