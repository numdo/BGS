import React, { useRef, useState } from "react";
import FeedDefaultImage from "../../assets/images/feeddefaultimage.png";

const DEFAULT_IMAGE_URL = FeedDefaultImage;

const formatDate = (dateString) => {
  const [year, month, day] = dateString.split("-");
  return `${month}-${day}`;
};

const FeedItem = ({ feed, onClick }) => {
  const isVideo = feed.imageUrl?.endsWith(".mp4");
  const videoRef = useRef(null);
  const [hovered, setHovered] = useState(false); // 호버 상태 관리

  const handleMouseEnter = () => {
    setHovered(true);
    if (videoRef.current) {
      videoRef.current
        .play()
        .catch((err) => console.error("Video play error:", err));
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

      {/* 기본 이미지 위에 날짜 표시 */}
      {!feed.imageUrl && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold bg-black bg-opacity-50 rounded-md">
          {formatDate(feed.workoutDate)}
        </div>
      )}

      {/* 기존 Hover 효과 포함 */}
      <div
        className={`absolute inset-0 bg-black bg-opacity-20 transition-opacity ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
      ></div>
    </div>
  );
};

export default FeedItem;