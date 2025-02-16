// src/components/mygym/CommentItem.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../api/User";
import useUserStore from "../../stores/useUserStore";
import myinfo from "../../assets/icons/myinfo.png";
import more from "../../assets/icons/more.svg";
import { timeSince } from "../../utils/timeSince";

const CommentList = React.memo(
  ({
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

    // "방금 전 / 몇분 전 / 몇시간 전..." 등 계산
    const displayedTime = timeSince(memo.createdAt);

    // 작성자 정보 가져오기
    useEffect(() => {
      if (memo.guestId !== currentUserId) {
        getUser(memo.guestId)
          .then((data) => setGuestInfo(data))
          .catch((error) => {
            console.error(`사용자 정보(${memo.guestId}) 조회 오류:`, error);
          });
      }
    }, [memo.guestId, currentUserId]);

    // 프로필 이미지 & 닉네임
    const profileImage =
      memo.guestId === currentUserId
        ? user.profileImageUrl || myinfo
        : (guestInfo && guestInfo.profileImageUrl) || myinfo;

    const writerName =
      memo.guestId === currentUserId
        ? user.nickname || ""
        : (guestInfo && guestInfo.nickname) || "";

    // 프로필 클릭 시 이동
    const handleProfileClick = useCallback(() => {
      navigate(`/profile/${memo.guestId}`);
    }, [memo.guestId, navigate]);

    return (
      <div className="flex items-start space-x-3 p-2 border-b">
        {/* 왼쪽: 프로필 이미지 */}
        <img
          src={profileImage}
          alt="프로필"
          className="w-10 h-10 rounded-full cursor-pointer"
          onClick={handleProfileClick}
        />

        {/* 오른쪽: 이름/시간/더보기 + 내용(또는 수정 input) */}
        <div className="flex-1 flex flex-col">
          {/* 상단: 이름, 작성시간, (수정/삭제 버튼) */}
          <div className="flex items-center justify-between">
            {/* 이름 + 작성시간 */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold">{writerName}</span>
              <span className="text-xs text-gray-400">{displayedTime}</span>
            </div>

            {/* 수정/삭제/더보기 아이콘 (작성자 본인일 때만) */}
            {currentUserId === memo.guestId && (
              <div className="relative">
                {editingCommentId === memo.guestbookId ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onSaveEditing(memo.guestbookId)}
                      className="text-green-500 text-sm"
                    >
                      저장
                    </button>
                    <button
                      onClick={onCancelEditing}
                      className="text-gray-500 text-sm"
                    >
                      취소
                    </button>
                  </div>
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
                        src={more}
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

          {/* 하단: 댓글 내용 or 수정 중이면 input */}
          <div className="mt-1">
            {editingCommentId === memo.guestbookId ? (
              <input
                type="text"
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                className="border p-1 rounded w-full"
                autoFocus
              />
            ) : (
              <p className="text-gray-800">{memo.content}</p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default CommentList;
