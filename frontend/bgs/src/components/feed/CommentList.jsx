import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import person from "../../assets/icons/person.svg";
import more_horiz from "../../assets/icons/more_horiz.svg";
const API_URL = "/diaries";

const CommentList = ({ diaryId }) => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_URL}/${diaryId}/comments`,
          {
            page: 1,
            pageSize: 100,
          }
        );
        console.log(response.data.content);
        setComments(response.data.content);
      } catch (error) {
        console.error("댓글 불러오기 오류:", error);
      }
    };

    fetchComments();
  }, [diaryId]);

  return (
    <div>
      <ul className="mt-2">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.commentId} className="border-b py-2">
              <div className="flex">
                <img
                  className="p-2"
                  src={comment.profileImageUrl || person}
                  alt=""
                />
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <p className="text-sm font-semibold">{comment.writer}</p>
                    <p className="ml-3 text-xs text-gray-400">
                      {comment.createdAt}
                    </p>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
                <img className="ml-auto" src={more_horiz} alt="" />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">댓글이 없습니다.</p>
        )}
      </ul>
    </div>
  );
};

export default CommentList;
