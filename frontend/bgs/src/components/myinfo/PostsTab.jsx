import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFeeds } from "../../api/Feed";
import FeedItem from "../../components/feed/FeedItem";
import FeedDefaultImage from "../../assets/images/FeedDefaultImage.png"; // 기본 이미지

const PostsTab = ({ userId, nickname }) => {
  // ✅ userId와 nickname만 props로 받음
  const [feeds, setFeeds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return; // ✅ userId가 없으면 요청하지 않음

    const fetchUserFeeds = async () => {
      try {
        const response = await getFeeds(userId); // ✅ API 호출
        const userFeeds = response.map((item) => ({
          id: item.diaryId,
          imageUrl: item.imageUrl || FeedDefaultImage, // ✅ 기본 이미지 처리
          likedCount: item.likedCount,
          commentCount: item.commentCount,
        }));
        setFeeds(userFeeds);
      } catch (error) {
        console.error("❌ 유저 게시물 불러오기 실패:", error);
      }
    };

    fetchUserFeeds();
  }, [userId]); // ✅ userId가 변경될 때만 실행

  const handleImageClick = (id) => {
    navigate(`/feed/${id}`);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h3 className="text-xl font-bold mb-4">{nickname}님의 게시물</h3>
      {/* ✅ nickname을 받아서 출력 (user 객체 전체 필요 없음) */}

      {feeds.length === 0 ? (
        <p className="text-gray-500">게시물이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {feeds.map((feed) => (
            <FeedItem
              key={feed.id}
              feed={feed}
              onClick={() => handleImageClick(feed.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PostsTab;
