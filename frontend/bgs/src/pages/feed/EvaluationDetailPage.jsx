import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useUserStore from "../../stores/useUserStore.jsx";
import axiosInstance from "../../utils/axiosInstance";
import Slider from "react-slick";
import TopBar from "../../components/bar/TopBar";
import BottomBar from "../../components/bar/BottomBar";
import CommentInput from "../../components/feed/CommentInput"; // 댓글 입력 컴포넌트
import CommentList from "../../components/feed/CommentList"; // 댓글 목록 컴포넌트
import ProfileDefaultImage from "../../assets/icons/myinfo.png";
import MoreIcon from "../../assets/icons/more.svg";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const API_URL = "/evaluations";

const EvaluationDetailPage = () => {
  const { me } = useUserStore();
  const { evaluationId } = useParams();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState(null);
  const [approvalCount, setApprovalCount] = useState(0);
  const [voteCount, setVoteCount] = useState(0);
  const [voted, setVoted] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // 댓글 목록 갱신을 위한 상태
  const [comments, setComments] = useState([]); // 댓글 목록 상태

  // 평가글 데이터 불러오기
  useEffect(() => {
    axiosInstance
      .get(`${API_URL}/${evaluationId}`)
      .then((response) => {
        setEvaluation(response.data);
        setApprovalCount(response.data.approvalCount);
        setVoteCount(response.data.voteCount);
        setVoted(response.data.voted);
      })
      .catch((error) => console.error("게시글 불러오기 오류:", error));
  }, [evaluationId]);

  // 댓글 목록 불러오기
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_URL}/${evaluationId}/comments`
        );
        setComments(response.data);
      } catch (error) {
        console.error("댓글 불러오기 오류:", error);
      }
    };

    fetchComments();
  }, [evaluationId, refreshKey]);

  // 평가 데이터가 아직 로드되지 않았다면 LoadingSpinner 표시
  if (!evaluation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  // 프로필 클릭 시 해당 유저 프로필 페이지로 이동하는 함수
  const handleProfileClick = () => {
    if (evaluation.userId) {
      navigate(`/profile/${evaluation.userId}`);
    }
  };

  // 투표 기능 (찬성 / 반대 / 취소)
  const handleVote = async (approval) => {
    const newVote = voted === approval ? null : approval;

    try {
      await axiosInstance.post(`${API_URL}/${evaluationId}/votes`, {
        approval: newVote,
      });

      setVoted(newVote);

      // 투표 상태 변경 반영
      setApprovalCount((prevApproval) => {
        if (newVote === true) {
          return voted === false
            ? prevApproval + 1
            : prevApproval + (voted === null ? 1 : 0);
        } else if (newVote === false) {
          return voted === true ? prevApproval - 1 : prevApproval;
        } else {
          return voted === true ? prevApproval - 1 : prevApproval;
        }
      });

      setVoteCount((prevVote) => {
        if (newVote === null) {
          return prevVote - 1;
        } else if (voted === null) {
          return prevVote + 1;
        } else {
          return prevVote;
        }
      });
    } catch (error) {
      console.error("투표 처리 오류:", error);
    }
  };

  // 메뉴 토글 함수
  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  // 댓글 작성 함수
  const handleCommentSubmit = async (content) => {
    try {
      await axiosInstance.post(`${API_URL}/${evaluationId}/comments`, {
        diaryId: evaluationId,
        content,
      });

      setRefreshKey((prev) => prev + 1); // 댓글 추가 후 목록 갱신
    } catch (error) {
      console.error("댓글 작성 오류:", error);
    }
  };

  // 댓글 삭제 함수
  const onDelete = (commentId) => {
    setComments((prev) =>
      prev.filter((comment) => comment.commentId !== commentId)
    );
    axiosInstance.delete(`/evaluations/${evaluationId}/comments/${commentId}`);
  };

  // 댓글 수정 함수
  const onUpdate = (commentId, content) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.commentId === commentId
          ? { ...comment, content: content }
          : comment
      )
    );
    axiosInstance.patch(`/evaluations/${evaluationId}/comments/${commentId}`, {
      commentId,
      content,
    });
  };

  // 캐러셀 설정
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <>
      <TopBar />
      <div className="relative max-w-2xl mx-auto">
        <div className="p-4 pb-20">
          {/* 프로필 & 작성자 */}
          <div className="w-full flex items-center justify-between mb-4">
            <div className="flex items-center">
              <img
                src={evaluation.profileImageUrl || ProfileDefaultImage}
                alt="프로필"
                className="w-10 h-10 rounded-full cursor-pointer"
                onClick={handleProfileClick}
              />
              <p
                className="ml-2 font-bold cursor-pointer"
                onClick={handleProfileClick}
              >
                {evaluation.writer}
              </p>
            </div>
            {evaluation.userId === me.userId && (
              <button
                className="bg-gray-100 rounded-md w-6 h-6"
                onClick={toggleMenu}
              >
                <img src={MoreIcon} alt="" />
              </button>
            )}
          </div>

          {/* 메뉴바 */}
          {isMenuOpen && (
            <div className="absolute right-0 bg-white border shadow-lg rounded-md w-40 z-10">
              <ul>
                <li
                  onClick={() => {
                    navigate(`/evaluationupdate/${evaluationId}`);
                  }}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                >
                  수정
                </li>
                <li
                  onClick={handleDeleteEvaluation}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                >
                  삭제
                </li>
              </ul>
            </div>
          )}

          {/* 이미지 캐러셀 */}
          <Slider {...settings}>
            {evaluation.imageUrls.length > 0 ? (
              evaluation.imageUrls.map((media, index) => (
                <div key={index} className="w-full">
                  {media.endsWith(".mp4") ||
                  media.endsWith(".webm") ||
                  media.endsWith(".avi") ? (
                    <video controls className="w-full rounded-md">
                      <source src={media} type="video/mp4" />
                      브라우저가 비디오 태그를 지원하지 않습니다.
                    </video>
                  ) : (
                    <img
                      src={media}
                      alt="게시글 미디어"
                      className="w-full rounded-md"
                    />
                  )}
                </div>
              ))
            ) : (
              <p>미디어가 없습니다.</p>
            )}
          </Slider>

          {/* 게시글 정보 */}
          <div className="mt-4">
            <p className="text-lg font-bold">{evaluation.content}</p>
            <p className="text-sm text-gray-500">{evaluation.workoutType}</p>
            <p className="mt-2 text-sm text-gray-700">{evaluation.weight}kg</p>
          </div>

          {/* 투표 (찬성 / 반대) */}
          <div className="mt-4 flex gap-4">
            <button
              onClick={() => handleVote(true)}
              className={`px-4 py-2 rounded-md ${
                voted === true
                  ? "bg-green-700 text-white"
                  : "bg-green-500 text-white"
              }`}
            >
              찬성 👍 {approvalCount}
            </button>
            <button
              onClick={() => handleVote(false)}
              className={`px-4 py-2 rounded-md ${
                voted === false
                  ? "bg-red-700 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              반대 👎 {voteCount - approvalCount}
            </button>
          </div>

          {/* 댓글 입력창 & 댓글 목록 */}
          <div className="mt-6">
            <CommentInput onCommentSubmit={handleCommentSubmit} />
            <CommentList
              key={refreshKey}
              comments={comments}
              userId={me.userId}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          </div>
        </div>

        <BottomBar />
      </div>
    </>
  );
};

export default EvaluationDetailPage;
