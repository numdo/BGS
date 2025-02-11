import React, { useRef, useState } from "react";
import FeedDefaultImage from "../../assets/images/FeedDefaultImage.png";

const DEFAULT_IMAGE_URL = FeedDefaultImage;

const FeedItem = ({ feed, onClick }) => {
  const isVideo = feed.imageUrl?.endsWith(".mp4");
  const videoRef = useRef(null);
  const [hovered, setHovered] = useState(false); // 호버 상태 관리

  const handleMouseEnter = () => {
    setHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch((err) => console.error("Video play error:", err));
    }
  };

  const handleMouseLeave = () => {
    setHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div 
      className="relative cursor-pointer" 
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 이미지 또는 동영상 */}
      {isVideo ? (
        <video
          ref={videoRef}
          src={feed.imageUrl}
          className="w-full h-full object-cover rounded-md"
          muted
          loop
          playsInline
          preload="auto"
        />
      ) : (
        <img
          src={feed.imageUrl || DEFAULT_IMAGE_URL}
          alt="Feed"
          className="w-full h-full object-cover rounded-md"
        />
      )}

      {/* 기존 Hover 효과 포함 */}
      <div 
        className={`absolute inset-0 bg-black bg-opacity-20 transition-opacity ${hovered ? 'opacity-100' : 'opacity-0'}`}
      ></div>

      {/* 좋아요 & 댓글 정보 */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded-md flex gap-2">
        {feed.voteCount === undefined ? (
          <span>❤️ {feed.likedCount}</span>
        ) : (
          <span>🟩 {feed.approvalCount}</span>
        )}
        {feed.voteCount === undefined ? (
          <span>💬 {feed.commentCount}</span>
        ) : (
          <span>🟥 {feed.voteCount - feed.approvalCount}</span>
        )}
      </div>
    </div>
  );
};

export default FeedItem;
