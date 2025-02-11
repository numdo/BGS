import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import Slider from "react-slick";
import TopBar from "../../components/bar/TopBar";
import BottomBar from "../../components/bar/BottomBar";
import CommentList from "../../components/feed/CommentList";
import CommentInput from "../../components/feed/CommentInput";
import FeedDefalutImage from "../../assets/images/FeedDefaultImage.png";
import ProfileDefaultImage from "../../assets/icons/myinfo.png";
import fire from "../../assets/icons/fire.svg";
import fire_colored from "../../assets/icons/fire_colored.svg";
import chat from "../../assets/icons/chat.svg";
import fitness_center from "../../assets/icons/fitness_center.svg";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const API_URL = "/diaries";

const DiaryDetailPage = () => {
  const { diaryId } = useParams();
  const navigate = useNavigate();
  const [feed, setFeed] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likedCount, setLikedCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(true);

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
      .get(`${API_URL}/${diaryId}`)
      .then((response) => {
        setFeed(response.data);
        setLikedCount(response.data.likedCount);
        setIsLiked(response.data.isLiked);
      })
      .catch((error) => console.error("게시글 불러오기 오류:", error));
  }, [diaryId]);

  if (!feed) return <p>로딩 중...</p>;

  // ✅ 프로필 클릭 시 해당 유저 프로필 페이지로 이동하는 함수
  const handleProfileClick = () => {
    if (feed.userId) {
      navigate(`/profile/${feed.userId}`); // ✅ 유저 ID 기반으로 이동
    }
  };

  // 좋아요 토글 함수
  const onLikeToggle = async () => {
    try {
      if (isLiked) {
        await axiosInstance.delete(`${API_URL}/${diaryId}/liked`);
        setLikedCount((prev) => prev - 1);
      } else {
        await axiosInstance.post(`${API_URL}/${diaryId}/liked`);
        setLikedCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("좋아요 처리 오류:", error);
    }
  };

  // 게시글 삭제 함수
  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await axiosInstance.delete(`${API_URL}/${diaryId}`);
        alert("삭제되었습니다.");
        navigate("/feed");
      } catch (error) {
        console.error("삭제 오류:", error);
      }
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
              src={feed.profileImageUrl || ProfileDefaultImage}
              alt="프로필"
              className="w-10 h-10 rounded-full cursor-pointer"
              onClick={handleProfileClick}
            />
            <div className="p-2">
              <p
                className="ml-2 font-bold cursor-pointer"
                onClick={handleProfileClick}
              >
                {feed.writer}
              </p>
              <p className="text-sm text-gray-500">{feed.workoutDate}</p>
            </div>

            {/* 메뉴바 */}
            <div className="ml-auto relative">
              {feed.userId == userId && (
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
                        navigate(`/workoutupdate/${diaryId}`); // 수정 페이지로 이동
                      }}
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
            {feed.images.length > 0 ? (
              feed.images.map((img) => (
                <img
                  key={img.imageId}
                  src={img.url}
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
            <p className="text-lg font-bold">{feed.content}</p>
            <p>{likedCount}번의 응원을 받았습니다</p>
            <div className="flex justify-around m-2">
              <div>
                <p className="text-gray-700 cursor-pointer">
                  {isLiked ? (
                    <img onClick={onLikeToggle} src={fire_colored} alt="" />
                  ) : (
                    <img onClick={onLikeToggle} src={fire} alt="" />
                  )}
                </p>
              </div>
              <div>
                <img
                  onClick={() => {
                    setIsCommentsOpen(!isCommentsOpen);
                  }}
                  src={chat}
                  alt=""
                />
              </div>
              <div>
                <img src={fitness_center} alt="" />
              </div>
            </div>
          </div>

          {/* 댓글 입력창 & 댓글 목록 */}
          {isCommentsOpen && (
            <div className="mt-6">
              <CommentInput diaryId={diaryId} onCommentAdded={() => {}} />
              <CommentList diaryId={diaryId} />
            </div>
          )}
        </div>

        <BottomBar />
      </div>
    </>
  );
};

export default DiaryDetailPage;
