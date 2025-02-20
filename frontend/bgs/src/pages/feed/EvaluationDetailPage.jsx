// src/pages/EvaluationDetailPage.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useUserStore from "../../stores/useUserStore.jsx";
import axiosInstance from "../../utils/axiosInstance";
import Slider from "react-slick";
import TopBar from "../../components/bar/TopBar";
import BottomBar from "../../components/bar/BottomBar";
import CommentInput from "../../components/feed/CommentInput";
import CommentList from "../../components/feed/CommentList";
import ProfileDefaultImage from "../../assets/icons/myinfo.png";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { showInformAlert } from "../../utils/toastrAlert.jsx";
import BeatLoader from "../../components/common/LoadingSpinner";

const API_URL = "/evaluations";

import useCoinStore from "../../stores/useCoinStore";
import { getUser } from "../../api/User";

// ★ 운동 타입 매핑 객체
const workoutTypeMap = {
  DEAD: "데드리프트",
  BENCH: "벤치프레스",
  SQUT: "스쿼트",
};

const EvaluationDetailPage = () => {
  const { me } = useUserStore();
  const { evaluationId } = useParams();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState(null);
  const [approvalCount, setApprovalCount] = useState(0);
  const [voteCount, setVoteCount] = useState(0);
  const [voted, setVoted] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [comments, setComments] = useState([]);

  const { setCoinCount } = useCoinStore();

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

  // 로딩 스피너
  if (!evaluation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <BeatLoader />
      </div>
    );
  }

  // 프로필 클릭 시
  const handleProfileClick = () => {
    if (evaluation.userId === me.userId) {
      navigate(`/myinfo`);
    } else {
      navigate(`/profile/${evaluation.userId}`);
    }
  };

  // 투표 기능
  const handleVote = async (approval) => {
    const newVote = voted === approval ? null : approval;
    try {
      await axiosInstance.post(`${API_URL}/${evaluationId}/votes`, {
        approval: newVote,
      });
      setVoted(newVote);

      // 투표 수 업데이트 로직 (기존과 동일)
      setApprovalCount((prev) => {
        if (newVote === true) {
          return voted === false ? prev + 1 : prev + (voted === null ? 1 : 0);
        } else if (newVote === false) {
          return voted === true ? prev - 1 : prev;
        } else {
          return voted === true ? prev - 1 : prev;
        }
      });
      setVoteCount((prev) => {
        if (newVote === null) return prev - 1;
        else if (voted === null) return prev + 1;
        else return prev;
      });

      // ④ 투표 후 코인 재조회 → 전역 스토어 반영
      try {
        const userData = await getUser(0); // /users/me
        setCoinCount(userData.coin);
      } catch (err) {
        console.error("코인 재조회 실패:", err);
      }
    } catch (error) {
      console.error("투표 처리 오류:", error);
    }
  };

  // 메뉴 열기/닫기
  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  // 게시글 수정
  const handleUpdate = () => {
    if (evaluation.userId !== me.userId) {
      showInformAlert("본인의 게시물이 아니면 수정할 수 없습니다.");
    } else if (evaluation.opened) {
      showInformAlert("투표가 시작된 게시물은 수정할 수 없습니다.");
    } else {
      navigate(`/evaluationupdate/${evaluationId}`);
    }
  };

  // 게시글 삭제
  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await axiosInstance.delete(`${API_URL}/${evaluationId}`);
        alert("삭제되었습니다.");
        navigate("/feeds");
      } catch (error) {
        console.error("삭제 오류:", error);
      }
    }
  };

  // 댓글 작성
  const handleCommentSubmit = async (content) => {
    try {
      await axiosInstance.post(`${API_URL}/${evaluationId}/comments`, {
        diaryId: evaluationId,
        content,
      });
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("댓글 작성 오류:", error);
    }
  };

  // 댓글 삭제
  const onDelete = (commentId) => {
    setComments((prev) =>
      prev.filter((comment) => comment.commentId !== commentId)
    );
    axiosInstance.delete(`/evaluations/${evaluationId}/comments/${commentId}`);
  };

  // 댓글 수정
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
          <div className="flex items-center mb-4">
            <img
              src={evaluation.profileImageUrl || ProfileDefaultImage}
              alt="프로필"
              className="w-10 h-10 rounded-full cursor-pointer m-1"
              onClick={handleProfileClick}
            />
            <div className="ml-1 p-2 pb-1">
              <p
                className="font-bold cursor-pointer"
                onClick={handleProfileClick}
              >
                {evaluation.writer}
              </p>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(evaluation.createdAt), {
                  addSuffix: true,
                  locale: ko,
                })}
              </p>
            </div>

            {/* 메뉴바 */}
            <div className="ml-auto relative">
              {(evaluation.userId === me.userId || me.role === "ADMIN") && (
                <button onClick={toggleMenu} className="text-xl">
                  ⋮
                </button>
              )}

              {/* 메뉴 */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 bg-white border shadow-lg rounded-md w-40 z-10">
                  <ul>
                    <li
                      onClick={handleUpdate}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                    >
                      수정
                    </li>
                    <li
                      onClick={handleDelete}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                    >
                      삭제
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

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
            {/* ★ workoutType를 한국어로 표시 */}
            <p className="text-sm text-gray-500">
              {workoutTypeMap[evaluation.workoutType] || evaluation.workoutType}
            </p>
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
