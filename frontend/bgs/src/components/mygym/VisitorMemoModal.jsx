// src/components/mygym/VisitorMemoModal.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  createGuestBooks,
  deleteGuestBook,
  getGuestBooks,
  updateGuestBook,
} from "../../api/Mygym";
import CommentInput from "./CommentInput";
import CommentList from "./CommentList";
import BeatLoader from "../../components/common/LoadingSpinner"; // ✅ BeatLoader 추가

const VisitorMemoModal = ({
  isOpen,
  onClose,
  visitorMemos,
  setVisitorMemos,
  userId,
}) => {
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false); // ✅ 로딩 상태 추가
  const [startX, setStartX] = useState(0); // 🔄 스와이프 감지 변수
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
  const loadComments = useCallback(
    async (page = 0) => {
      setIsLoading(true); // ✅ 로딩 시작
      try {
        const data = await getGuestBooks(userId, page, 10);
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
      setIsLoading(false); // ✅ 로딩 종료
    },
    [userId, setVisitorMemos]
  );

  // 모달이 열릴 때 첫 페이지 댓글 로드
  useEffect(() => {
    if (isOpen) {
      loadComments(0);
    }
  }, [isOpen, loadComments]);

  // ✅ 좌우 스와이프 시 모달 닫기 기능 추가
  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    const moveX = e.touches[0].clientX - startX;

    if (moveX < -50) {
      onClose(); // ✅ 50px 이상 좌우 스와이프 시 모달 닫기
    }
  };

  // ✅ 댓글 추가 핸들러 (BeatLoader 적용 & totalCount 갱신)
  const handleAddComment = async () => {
    if (newComment.trim() === "") return;
    setIsLoading(true); // ✅ 로딩 시작
    try {
      const payload = { content: newComment };
      await createGuestBooks(userId, payload);
      await loadComments(0); // ✅ 최신 목록 불러오기 (totalCount 갱신)
      setNewComment("");
    } catch (error) {
      console.error("댓글 추가 실패:", error);
    }
    setIsLoading(false); // ✅ 로딩 종료
  };

  // ✅ 댓글 삭제 핸들러 (BeatLoader 적용 & totalCount 갱신)
  const handleDeleteMemo = async (guestbookId) => {
    setIsLoading(true); // ✅ 로딩 시작
    try {
      await deleteGuestBook(userId, guestbookId);
      await loadComments(0); // ✅ 최신 목록 불러오기 (totalCount 갱신)
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
    }
    setIsLoading(false); // ✅ 로딩 종료
  };

  return (
    <>
      {/* ✅ 로딩 화면 (화면 전체) */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-[99999]">
          <BeatLoader size={15} color="#ffffff" />
        </div>
      )}
      <div
        className={`fixed inset-0 z-[9999] flex items-end ${
          isOpen ? "visible bg-black bg-opacity-50" : "invisible"
        } transition-all duration-500`}
        onClick={onClose}
        onTouchStart={handleTouchStart} // 🔄 터치 시작 감지
        onTouchMove={handleTouchMove} // 🔄 터치 이동 감지
      >
        {/* 하단에서 올라오는 방명록 모달 */}
        <div
          className={`w-full max-w-md bg-white shadow-lg fixed bottom-0 left-1/2 transform -translate-x-1/2 ${
            isOpen ? "translate-y-0" : "translate-y-full"
          } transition-transform duration-500 rounded-t-3xl overflow-y-auto h-[calc(100%-4rem)] p-4`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 닫기 버튼 */}
          <button
            className="text-gray-500 text-center w-full"
            onClick={onClose}
          >
            ▼
          </button>

          {/* ✅ 모달 내부 컨텐츠 (스크롤 가능) */}
          <div className="flex flex-col h-full overflow-hidden">
            <h2 className="text-lg font-semibold text-center mb-4">방명록</h2>

            {/* 댓글 입력 */}
            <div className="px-4">
              <CommentInput
                newComment={newComment}
                setNewComment={setNewComment}
                onAddComment={async () => {
                  if (newComment.trim() === "") return;
                  setIsLoading(true); // ✅ 로딩 시작
                  try {
                    const payload = { content: newComment };
                    await createGuestBooks(userId, payload);
                    loadComments(0);
                    setNewComment("");
                  } catch (error) {
                    console.error("댓글 추가 실패:", error);
                  }
                  setIsLoading(false); // ✅ 로딩 종료
                }}
              />
            </div>

            {/* ✅ 댓글 목록 (스크롤 가능) */}
            <div className="flex-1 overflow-y-auto px-4 mt-4">
              {visitorMemos.length === 0 ? (
                <div className="text-center text-gray-500 mt-4">
                  아직 작성된 방명록이 없습니다.
                  <br />
                  방명록을 작성하여 친구에게 인사해보세요!
                </div>
              ) : (
                visitorMemos.slice().reverse().map((memo) => (
                  <CommentList
                    key={memo.guestbookId}
                    memo={memo}
                    editingCommentId={editingCommentId}
                    editingContent={editingContent}
                    setEditingContent={setEditingContent}
                    onStartEditing={(memo) => {
                      setEditingCommentId(memo.guestbookId);
                      setEditingContent(memo.content);
                    }}
                    onCancelEditing={() => {
                      setEditingCommentId(null);
                      setEditingContent("");
                    }}
                    onSaveEditing={async (guestbookId) => {
                      try {
                        const payload = { content: editingContent };
                        await updateGuestBook(userId, guestbookId, payload);
                        loadComments(0);
                        setEditingCommentId(null);
                        setEditingContent("");
                      } catch (error) {
                        console.error("댓글 수정 실패:", error);
                      }
                    }}
                    onDeleteMemo={async (guestbookId) => {
                      setIsLoading(true); // ✅ 로딩 시작
                      try {
                        await deleteGuestBook(userId, guestbookId);
                        await loadComments(0);
                      } catch (error) {
                        console.error("댓글 삭제 실패:", error);
                      }
                      setIsLoading(false); // ✅ 로딩 종료
                    }}
                  />
                ))
              )}
            </div>

            {/* ✅ 더보기 버튼 */}
            <div className="flex justify-center mt-4 mb-4 px-4">
              {currentPage < totalPages - 1 && (
                <button
                  onClick={() => loadComments(currentPage + 1)}
                  className="px-4 py-2 bg-gray-200 rounded-full"
                >
                  더보기
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VisitorMemoModal;
