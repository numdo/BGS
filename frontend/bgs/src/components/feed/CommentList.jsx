import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const API_URL = "/diaries";

const CommentList = ({ diaryId }) => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axiosInstance.get(`${API_URL}/${diaryId}/comments`);
        setComments(response.data.content);
      } catch (error) {
        console.error("댓글 불러오기 오류:", error);
      }
    };

    fetchComments();
  }, [diaryId]);

  return (
    <div>
      <h3 className="mt-2 text-sm text-gray-700">{comments.length} 💬</h3>
      <ul className="mt-2">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <li key={comment.commentId} className="border-b py-2">
              <p className="text-sm font-semibold">{comment.writer}</p>
              <p className="text-sm">{comment.content}</p>
              <p className="text-xs text-gray-400">{comment.createdAt}</p>
            </li>
          ))
        ) : (
          <p className="text-sm text-gray-500">댓글이 없습니다.</p>
        )}
      </ul>
    </div>
  );
};

export default CommentList;