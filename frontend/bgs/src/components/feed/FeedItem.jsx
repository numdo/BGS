import React from "react";

const DEFAULT_IMAGE_URL =
  "https://bgs-ssafy-bucket.s3.ap-northeast-2.amazonaws.com/images/diary/15/d4501711-1e98-419f-85c2-4f09cddb4105_e4970519f9571c4bdd4c27ec4c1050173cd7f61eae53168a0bb03d76106d7397.jpg";

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
