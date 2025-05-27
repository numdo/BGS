// src/components/mygym/VisitorComment.jsx
import React, { useState, useEffect, useCallback } from "react";
import { getGuestBooks, createGuestBooks } from "../../api/Mygym";
import CommentInput from "./CommentInput";
import CommentList from "./CommentList";

const VisitorComment = ({ userId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // 최초 댓글 로드 (최신 댓글부터 10개씩)
  useEffect(() => {
    async function loadComments(page = 0) {
      try {
        const data = await getGuestBooks(userId, page, 10);
        // 삭제되지 않은 댓글만 필터링
        const freshComments = data.content.filter((comment) => !comment.deleted);
        if (page === 0) {
          setComments(freshComments);
        } else {
          setComments((prev) => [...prev, ...freshComments]);
        }
        setCurrentPage(data.number);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("댓글 불러오기 실패:", error);
      }
    }
    loadComments(0);
  }, [userId]);

  // 새 댓글 추가 핸들러
  const handleAddComment = useCallback(async () => {
    if (newComment.trim() === "") return;
    try {
      await createGuestBooks(userId, { content: newComment });
      // 댓글 추가 후 첫 페이지를 다시 로드하여 최신 댓글을 가져옴
      const data = await getGuestBooks(userId, 0, 10);
      const freshComments = data.content.filter((comment) => !comment.deleted);
      setComments(freshComments);
      setCurrentPage(data.number);
      setTotalPages(data.totalPages);
      setNewComment("");
    } catch (error) {
      console.error("댓글 추가 실패:", error);
    }
  }, [newComment, userId]);

  // 더보기 버튼 핸들러 (다음 페이지 댓글 불러오기)
  const handleLoadMore = async () => {
    if (currentPage < totalPages - 1) {
      try {
        const nextPage = currentPage + 1;
        const data = await getGuestBooks(userId, nextPage, 10);
        const freshComments = data.content.filter((comment) => !comment.deleted);
        setComments((prev) => [...prev, ...freshComments]);
        setCurrentPage(data.number);
      } catch (error) {
        console.error("추가 댓글 불러오기 실패:", error);
      }
    }
  };

  return (
    // 부모에서 높이(예: flex-grow)를 지정해 VisitorComment가 BottomBar 위까지 채워지도록 조정하세요.
    <div className="visitor-comment-container flex flex-col h-full">
      {/* 상단에 고정된 댓글 입력 영역 (TopBar 역할) */}
      <div className="border-b">
        <CommentInput
          newComment={newComment}
          setNewComment={setNewComment}
          onAddComment={handleAddComment}
        />
      </div>
      {/* 댓글 목록 영역: 최신 댓글이 위에 오도록 reverse() */}
      <div className="flex-1 overflow-y-auto">
        {comments
          .slice() // 원본 배열 보존
          .reverse()
          .map((comment) => (
            <CommentList key={comment.guestbookId} memo={comment} />
          ))}
        {currentPage < totalPages - 1 && (
          <div className="flex justify-center py-2">
            <button
              className="px-4 py-2 bg-gray-200 rounded-full"
              onClick={handleLoadMore}
            >
              더보기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitorComment;
