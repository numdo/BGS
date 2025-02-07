import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import Slider from "react-slick";
import TopBar from "../../components/bar/TopBar";
import BottomBar from "../../components/bar/BottomBar";
import CommentList from "../../components/feed/CommentList";
import CommentInput from "../../components/feed/CommentInput";
import ProfileDefaultImage from "../../assets/icons/MyInfo.png";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const API_URL = "/evaluations";

const EvaluationDetailPage = () => {
  const { evaluationId } = useParams();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likedCount, setLikedCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        setUserId(decodedToken.sub);
      } catch (error) {
        console.error("토큰 디코딩 오류:", error);
      }
    }

    axiosInstance
      .get(`${API_URL}/${evaluationId}`)
      .then((response) => {
        setEvaluation(response.data);
        setLikedCount(response.data.likedCount);
        setIsLiked(response.data.isLiked);
      })
      .catch((error) => console.error("게시글 불러오기 오류:", error));
  }, [evaluationId]);

  if (!evaluation) return <p>로딩 중...</p>;

  // 좋아요 토글 함수
  const onLikeToggle = async () => {
    try {
      if (isLiked) {
        await axiosInstance.delete(`${API_URL}/${evaluationId}/liked`);
        setLikedCount((prev) => prev - 1);
      } else {
        await axiosInstance.post(`${API_URL}/${evaluationId}/liked`);
        setLikedCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("좋아요 처리 오류:", error);
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
              className="w-10 h-10 rounded-full"
            />
            <p className="ml-2 font-bold">{evaluation.writer}</p>

            {/* 메뉴바 */}
            <div className="ml-auto relative">
              {evaluation.userId == userId && (
                <button onClick={toggleMenu} className="text-xl">
                  ⋮
                </button>
              )}

              {/* 메뉴 */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 bg-white border shadow-lg rounded-md w-40 z-10">
                  <ul>
                    <li
                      onClick={() => {
                        navigate("/evaluationupdate"); // 수정 페이지로 이동
                      }}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                    >
                      수정
                    </li>
                    <li
                      onClick={() => {
                        // 삭제 로직 추가 (필요하면)
                      }}
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
              evaluation.imageUrls.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt="게시글 이미지"
                  className="w-full rounded-md"
                />
              ))
            ) : (
              <img
                src={FeedDefalutImage}
                alt="게시글 기본 이미지"
                className="w-full rounded-md"
              />
            )}
          </Slider>

          {/* 게시글 정보 */}
          <div className="mt-4">
            <p className="text-lg font-bold">{evaluation.content}</p>
            <p className="text-sm text-gray-500">{evaluation.workoutType}</p>
            <p className="mt-2 text-sm text-gray-700">{evaluation.weight}kg</p>
            <p
              className="mt-2 text-sm text-gray-700 cursor-pointer"
              onClick={onLikeToggle}
            >
              {likedCount} {isLiked ? "❤️" : "🤍"}
            </p>
          </div>

          {/* 댓글 입력창 & 댓글 목록 */}
          <div className="mt-6">
            <CommentInput diaryId={evaluationId} onCommentAdded={() => {}} />
            <CommentList diaryId={evaluationId} />
          </div>
        </div>

        <BottomBar />
      </div>
    </>
  );
};

export default EvaluationDetailPage;
