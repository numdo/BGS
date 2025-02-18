import { useState } from "react";

const CommentInput = ({ onCommentSubmit }) => {
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!comment.trim()) return;

    onCommentSubmit(comment); // 부모 컴포넌트로 댓글 전달
    setComment(""); // 댓글 입력 필드 초기화
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
      <button
        type="submit"
        className="ml-2 px-4 py-2 bg-primary text-white rounded-md"
      >
        등록
      </button>
    </form>
  );
};

export default CommentInput;
