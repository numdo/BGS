import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useUserStore from "../../stores/useUserStore.jsx";
import axiosInstance from "../../utils/axiosInstance";
import Slider from "react-slick";
import TopBar from "../../components/bar/TopBar";
import BottomBar from "../../components/bar/BottomBar";
import ProfileDefaultImage from "../../assets/icons/myinfo.png";
import MoreIcon from "../../assets/icons/more.svg";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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
  useEffect(() => {
    console.log(me);
  }, [me]);
  if (!evaluation) return <p>로딩 중...</p>;

  // ✅ 프로필 클릭 시 해당 유저 프로필 페이지로 이동하는 함수
  const handleProfileClick = () => {
    if (evaluation.userId) {
      navigate(`/profile/${evaluation.userId}`);
    }
  };

  // ✅ 투표 기능 (찬성 / 반대 / 취소)
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

  // 캐러셀 설정
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };
  const handleDeleteEvaluation = async () => {
    if (!window.confirm("정말로 삭제하시겠습니까?")) return;

    try {
      await axiosInstance.delete(`${API_URL}/${evaluationId}`);
      alert("삭제가 완료되었습니다.");
      navigate("/feeds"); // 삭제 후 목록 페이지로 이동
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
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
          <div>
            {/* 메뉴바 */}
            <div className="ml-auto relative">
              {/* 메뉴 */}
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
            </div>
          </div>

          {/* 이미지 캐러셀 */}
          <Slider {...settings}>
            {evaluation.imageUrls.length > 0 ? (
              evaluation.imageUrls.map((media, index) => (
                <div key={index} className="w-full">
                  {/* 확장자를 통해 이미지와 동영상을 구분 */}
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

          {/* ✅ 투표 (찬성 / 반대) */}
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
        </div>

        <BottomBar />
      </div>
    </>
  );
};

export default EvaluationDetailPage;
