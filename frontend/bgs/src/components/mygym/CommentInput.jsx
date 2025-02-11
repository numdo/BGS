// src/components/mygym/CommentInput.jsx
import React from "react";
import myinfo from "../../assets/icons/myinfo.png";
import useUserStore from "../../stores/useUserStore";

const CommentInput = React.memo(
  ({ newComment, setNewComment, onAddComment }) => {
    const { user } = useUserStore();

    return (
      <div className="flex items-center space-x-3 p-3 border-b">
        <img
          src={user.profileImageUrl || myinfo}
          alt="프로필"
          className="w-10 h-10 rounded-full"
        />
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글 추가..."
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button onClick={onAddComment} className="text-blue-500 font-bold">
          등록
        </button>
      </div>
    );
  }
);

export default CommentInput;
