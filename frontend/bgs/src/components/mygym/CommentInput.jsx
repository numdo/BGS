// src/components/mygym/CommentInput.jsx
import React from "react";
import myinfo from "../../assets/icons/myinfo.png";
import useUserStore from "../../stores/useUserStore";
import send from "../../assets/icons/send.png";

const CommentInput = React.memo(
  ({ newComment, setNewComment, onAddComment }) => {
    const { user } = useUserStore();

    const handleKeyDown = (e) => {
      if(e.key === "Enter") {
        e.preventDefault();
        onAddComment();
      }
    };

    return (
      <div className="flex items-center space-x-3 p-3 border-b w-full z-50">
        <img
          src={user.profileImageUrl || myinfo}
          alt="프로필"
          className="w-10 h-10 rounded-full"
        />
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="방명록 추가..."
          className="flex-1 min-w-0 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          style={{zIndex:5}}
        />
        <img src={send} alt="전송" onClick={onAddComment} />
      </div>
    );
  }
);

export default CommentInput;
