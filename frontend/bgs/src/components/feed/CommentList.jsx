import { useState } from "react";
import { formatDistance } from "date-fns";
import { ko } from "date-fns/locale";
import person from "../../assets/icons/person.svg";
import more_horiz from "../../assets/icons/more_horiz.svg";
import editicon from "../../assets/icons/commentedit.png";
import deleteicon from "../../assets/icons/delete.svg";
import cancelicon from "../../assets/icons/cancel.svg";

import { useNavigate } from "react-router-dom";

const CommentList = ({ comments, userId, onDelete, onUpdate }) => {
  const navigate = useNavigate();
  const [showActionsId, setShowActionsId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState("");

  // 더보기 버튼 클릭 핸들러
  const handleMoreClick = (commentId) => {
    setShowActionsId(commentId);
  };

  // 취소 버튼 클릭 핸들러
  const handleCancel = () => {
    setShowActionsId(null);
    setEditingCommentId(null);
    setEditedContent("");
  };

  // 수정 버튼 클릭 핸들러
  const handleEditClick = (comment) => {
    setEditingCommentId(comment.commentId);
    setEditedContent(comment.content);
  };

  // 수정 완료 버튼 클릭 핸들러
  const handleUpdate = (commentId) => {
    if (editedContent.trim()) {
      onUpdate(commentId, editedContent); // 부모 컴포넌트에서 업데이트 처리
    }
    handleCancel();
  };

  return (
    <div>
      <ul className="mt-2">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.commentId} className="border-b py-2">
              <div className="flex">
                <img
                  className="m-1 mx-2 w-7 h-7 rounded-full cursor-pointer"
                  onClick={() => navigate(`/profile/${comment.userId}`)}
                  src={comment.profileUrl || person}
                  alt=""
                />
                <div className="flex flex-col flex-grow">
                  <div className="flex items-center">
                    <p className="text-sm font-semibold">{comment.writer}</p>
                    <p className="ml-3 text-xs text-gray-400">
                      {formatDistance(new Date(comment.createdAt), new Date(), {
                        locale: ko,
                      })}{" "}
                      전
                    </p>
                  </div>

                  {editingCommentId === comment.commentId ? (
                    // ✏️ 수정 중일 때 입력창 표시
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleUpdate(comment.commentId);
                          }
                        }}
                        className="border rounded flex-grow"
                      />
                    </div>
                  ) : (
                    <p className="text-sm">{comment.content}</p>
                  )}
                </div>

                {userId === comment.userId && (
                  <div className="ml-auto">
                    {showActionsId === comment.commentId ? (
                      // ✨ 더보기 버튼을 클릭하면 수정/삭제/취소 버튼 표시
                      <div className="flex gap-2">
                        <img
                          src={editicon}
                          alt="수정"
                          className="w-5 h-5 cursor-pointer"
                          onClick={() => handleEditClick(comment)}
                        />
                        <img
                          src={deleteicon}
                          alt="삭제"
                          className="w-5 h-5 cursor-pointer"
                          onClick={() => onDelete(comment.commentId)}
                        />
                        <img
                          src={cancelicon}
                          alt="취소"
                          className="w-5 h-5 cursor-pointer"
                          onClick={handleCancel}
                        />
                      </div>
                    ) : (
                      // ➕ 더보기 버튼
                      <img
                        src={more_horiz}
                        alt="더보기"
                        className="w-5 h-5 cursor-pointer"
                        onClick={() => handleMoreClick(comment.commentId)}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 m-3">댓글이 없습니다.</p>
        )}
      </ul>
    </div>
  );
};

export default CommentList;
