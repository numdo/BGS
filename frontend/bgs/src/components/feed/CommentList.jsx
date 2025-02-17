import { formatDistance } from "date-fns";
import { ko } from "date-fns/locale";
import person from "../../assets/icons/person.svg";
import more_horiz from "../../assets/icons/more_horiz.svg";

const CommentList = ({ key, comments }) => {
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
                      {formatDistance(new Date(comment.createdAt), new Date(), {
                        locale: ko,
                      })}{" "}
                      전
                    </p>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
                <img className="ml-auto" src={more_horiz} alt="" />
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
