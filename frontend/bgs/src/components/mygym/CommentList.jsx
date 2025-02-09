// src/components/feed/CommentItem.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../api/User";
import useUserStore from "../../stores/useUserStore";
import ProfileDefaultImage from "../../assets/icons/MyInfo.png";
import MoreIcon from "../../assets/icons/More.svg";

const CommentItem = React.memo(({
  memo,
  editingCommentId,
  editingContent,
  setEditingContent,
  onStartEditing,
  onCancelEditing,
  onSaveEditing,
  onDeleteMemo,
}) => {
  const [guestInfo, setGuestInfo] = useState(null);
  const [showActions, setShowActions] = useState(false);
  const { user } = useUserStore();
  const currentUserId = user.userId;
  const navigate = useNavigate();

  useEffect(() => {
    if (memo.guestId !== currentUserId) {
      getUser(memo.guestId)
        .then((data) => setGuestInfo(data))
        .catch((error) => {
          console.error(`사용자 정보(${memo.guestId}) 조회 오류:`, error);
        });
    }
  }, [memo.guestId, currentUserId]);

  const profileImage =
    memo.guestId === currentUserId
      ? user.profileImageUrl || ProfileDefaultImage
      : (guestInfo && guestInfo.profileImageUrl) || ProfileDefaultImage;

  const writerName =
    memo.guestId === currentUserId
      ? user.nickname || ""
      : (guestInfo && guestInfo.nickname) || "";

  const handleProfileClick = useCallback(() => {
    navigate(`/profile/${memo.guestId}`);
  }, [memo.guestId, navigate]);

  return (
    <div className="flex items-center justify-between space-x-3 p-2 border-b">
      <div className="flex items-center space-x-3">
        <div
          onClick={handleProfileClick}
          className="cursor-pointer flex items-center space-x-2"
        >
          <img
            src={profileImage}
            alt="프로필"
            className="w-10 h-10 rounded-full"
          />
          <div className="text-sm font-bold">{writerName}</div>
        </div>
        <div>
          {editingCommentId === memo.guestbookId ? (
            <input
              type="text"
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              className="border p-1 rounded"
              autoFocus
            />
          ) : (
            <p className="text-gray-800">{memo.content}</p>
          )}
        </div>
      </div>
      {currentUserId === memo.guestId && (
        <div className="flex items-center">
          {editingCommentId === memo.guestbookId ? (
            <>
              <button
                onClick={() => onSaveEditing(memo.guestbookId)}
                className="text-green-500 text-sm mr-2"
              >
                저장
              </button>
              <button onClick={onCancelEditing} className="text-gray-500 text-sm">
                취소
              </button>
            </>
          ) : (
            <>
              {showActions ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      onStartEditing(memo);
                      setShowActions(false);
                    }}
                    className="text-blue-500 text-sm"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => {
                      onDeleteMemo(memo.guestbookId);
                      setShowActions(false);
                    }}
                    className="text-red-500 text-sm"
                  >
                    삭제
                  </button>
                  <button
                    onClick={() => setShowActions(false)}
                    className="text-gray-500 text-sm"
                  >
                    닫기
                  </button>
                </div>
              ) : (
                <img
                  src={MoreIcon}
                  alt="더보기"
                  className="w-6 h-6 cursor-pointer"
                  onClick={() => setShowActions(true)}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
});

export default CommentItem;
