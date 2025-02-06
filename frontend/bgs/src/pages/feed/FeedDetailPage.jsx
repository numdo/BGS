import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Slider from "react-slick";
import TopBar from "../../components/bar/TopBar";
import BottomBar from "../../components/bar/BottomBar";
import CommentList from "../../components/feed/CommentList";
import CommentInput from "../../components/feed/CommentInput";
import ProfileDefaultImage from "../../assets/icons/MyInfo.png";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const API_URL = "https://i12c209.p.ssafy.io/api/diaries";

const FeedDetailPage = () => {
  const { diaryId } = useParams();
  const navigate = useNavigate();
  const [feed, setFeed] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likedCount, setLikedCount] = useState(0);

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

    axios
      .get(`${API_URL}/${diaryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setFeed(response.data);
        setLikedCount(response.data.likedCount);
        setIsLiked(response.data.isLiked);
      })
      .catch((error) => console.error("게시글 불러오기 오류:", error));
  }, [diaryId]);

  if (!feed) return <p>로딩 중...</p>;

  // 좋아요 토글 함수
  const onLikeToggle = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      if (isLiked) {
        await axios.delete(`${API_URL}/${diaryId}/liked`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLikedCount((prev) => prev - 1);
      } else {
        await axios.post(`${API_URL}/${diaryId}/liked`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
        await axios.delete(`${API_URL}/${diaryId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        alert("삭제되었습니다.");
        navigate("/feed");
      } catch (error) {
        console.error("삭제 오류:", error);
      }
    }
  };

  // 캐러셀 설정
  const settings = {
    dots: true,
    infinite: true,
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
              src={ProfileDefaultImage}
              alt="프로필"
              className="w-10 h-10 rounded-full"
            />
            <p className="ml-2 font-bold">상운</p>
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
                src={ProfileDefaultImage}
                alt="기본 이미지"
                className="w-full rounded-md"
              />
            )}
          </Slider>

          {/* 게시글 정보 */}
          <div className="mt-4">
            <p className="text-lg font-bold">{feed.content}</p>
            <p className="text-sm text-gray-500">{feed.workoutDate}</p>
            <p
              className="mt-2 text-sm text-gray-700 cursor-pointer"
              onClick={onLikeToggle}
            >
              {likedCount} {isLiked ? "❤️" : "🤍"}
            </p>
          </div>

          {/* 댓글 입력창 & 댓글 목록 */}
          <div className="mt-6">
            <CommentInput diaryId={diaryId} onCommentAdded={() => {}} />
            <CommentList diaryId={diaryId} />
          </div>
        </div>

        <BottomBar />
      </div>
    </>
  );
};

export default FeedDetailPage;
