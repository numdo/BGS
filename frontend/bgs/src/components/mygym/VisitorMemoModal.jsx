// src/components/mygym/VisitorMemoModal.jsx
import { useState, useEffect, useCallback } from "react";
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
  onAddMemo, // ✅ 방명록 추가 핸들러
  onDeleteMemo, // ✅ 방명록 삭제 핸들러
}) => {
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false); // ✅ 로딩 상태 추가
  const [modalBottom, setModalBottom] = useState("-100vh"); // 🔄 하단에서 위로 애니메이션
  const [modalHeight, setModalHeight] = useState("55vh"); // ✅ 모달 높이 조절

  // 댓글 수정 상태 관리
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  // 페이징 상태 관리
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ✅ 화면 크기 변화 감지하여 모달 위치 & 크기 조정
  useEffect(() => {
    const updateModalSize = () => {
      const windowHeight = window.innerHeight;
      const bottomOffset = 64.5; // ✅ 화면 크기에 따라 동적으로 하단 조정
      setModalBottom(`${bottomOffset}px`);
      setModalHeight(`${windowHeight * 0.5}px`); // ✅ 모달 높이를 화면 높이의 50%로 설정
    };

    if (isOpen) {
      updateModalSize(); // ✅ 모달이 열릴 때 즉시 적용
      window.addEventListener("resize", updateModalSize);
    } else {
      setModalBottom("-100vh"); // ✅ 모달 닫을 때 하단으로 숨김
    }

    return () => window.removeEventListener("resize", updateModalSize);
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

  // ✅ 댓글 추가 핸들러 (BeatLoader 적용 & totalCount 갱신)
  const handleAddComment = async () => {
    if (newComment.trim() === "") return;
    setIsLoading(true); // ✅ 로딩 시작
    try {
      const payload = { content: newComment };
      const newMemo = await createGuestBooks(userId, payload);
      onAddMemo(newMemo); // ✅ 새 방명록 즉시 반영
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
      onDeleteMemo(guestbookId); // ✅ 삭제 즉시 반영
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
      {/* ✅ 모달 바깥 영역을 클릭하면 모달 닫기 */}
      {isOpen && (
        <div
          className="fixed inset-0 flex justify-center items-end z-[99]" // ✅ z-index 낮춤
          onClick={onClose} // ✅ 바깥 클릭 시 모달 닫기
        >
          {/* 하단에서 올라오는 방명록 모달 */}
          <div
            className={`fixed left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white shadow-lg rounded-t-3xl overflow-hidden transition-all duration-500 z-[99]`}
            style={{
              bottom: modalBottom, // ✅ 화면 크기에 따라 자동 조정
              height: modalHeight, // ✅ 화면 크기에 따라 자동 조정
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <button
              className="text-gray-500 text-center w-full py-2"
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
                  onAddComment={handleAddComment}
                />
              </div>

              {/* ✅ 댓글 목록 (스크롤 가능) */}
              <div className="flex-1 overflow-y-auto px-4 mt-4">
                {visitorMemos.length === 0 ? (
                  <div className="text-center text-gray-500 mt-4">
                    아직 작성된 방명록이 없습니다.
                  </div>
                ) : (
                  visitorMemos.map((memo) => (
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
                      onDeleteMemo={handleDeleteMemo}
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
      )}
    </>
  );
};

export default VisitorMemoModal;
