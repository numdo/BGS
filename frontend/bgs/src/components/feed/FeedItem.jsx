import React from "react";
import FeedDefaultImage from "../../assets/images/FeedDefaultImage.png";

const DEFAULT_IMAGE_URL = FeedDefaultImage;

const FeedItem = ({ feed, onClick }) => {
  return (
    <div className="relative group cursor-pointer" onClick={onClick}>
      {/* 이미지 */}
      <img
        src={feed.imageUrl || DEFAULT_IMAGE_URL} // 이미지가 없으면 기본 이미지 사용
        alt="Feed"
        className="w-full h-full object-cover rounded-md"
      />

      {/* Hover 효과 */}
      <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity"></div>

      {/* 좋아요 & 댓글 정보 */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded-md flex gap-2">
        <span>❤️ {feed.likes ?? 0}</span>
        <span>💬 {feed.comments ?? 0}</span>
      </div>
    </div>
  );
};

export default FeedItem;
