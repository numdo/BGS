import React from "react";

const FeedItem = ({ feed, onClick }) => {
  return (
    <div className="relative group cursor-pointer" onClick={onClick}>
      <img
        src={feed.imageUrl}
        alt="Feed"
        className="w-full h-full object-cover rounded-md"
      />
      {/* Hover 효과 */}
      <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  );
};

export default FeedItem;
