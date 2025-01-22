import React from 'react';
import ArrowBackLogo from './../assets/ArrowBack.png'
import ShareLogo from './../assets/Share.png'
const TopBar = () => {
  return (
    <div className="w-full bg-gray-100 z-10">
      <div className="flex justify-between items-center px-4 py-2">
        {/* 뒤로가기 버튼 */}
        <button className="text-gray-600 hover:text-blue-500">
          <img src={ArrowBackLogo} alt="Home" className="w-6 h-6" />
        </button>
        
        {/* 제목 (중앙 정렬) */}
        <h1 className="text-lg font-bold text-gray-800">상단바</h1>

        {/* 공유 버튼 */}
        <button className="text-gray-600 hover:text-blue-500">
          <img src={ShareLogo} alt="Home" className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default TopBar;
