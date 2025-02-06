import React, { useState } from "react";
import axios from "axios";

const COMMENT_API_URL = "https://i12c209.p.ssafy.io/api/diaries";

const CommentInput = ({ diaryId, onCommentAdded }) => {
  const [comment, setComment] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) return;

    try {
      const token = localStorage.getItem("accessToken");
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const userId = decodedToken.sub;

      await axios.post(
        `${COMMENT_API_URL}/${diaryId}/comments`,
        { diaryId, userId, content: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComment("");
      onCommentAdded(); // 댓글 추가 후 목록 갱신
    } catch (error) {
      console.error("댓글 작성 오류:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex">
      <input
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="댓글을 입력하세요..."
        className="flex-1 px-3 py-2 border rounded-md"
      />
      <button type="submit" className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md">
        등록
      </button>
    </form>
  );
};

export default CommentInput;
