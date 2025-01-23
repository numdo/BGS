import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import ArrowBackLogo from './../assets/ArrowBack.png'
import ShareLogo from './../assets/Share.png'
import Favicon from './../assets/Favicon.png'
export default function TopBar() {
  const navigate = useNavigate(); // useNavigate 훅 사용

  const handleNavigation = (url) => {
    navigate(url); // url로 이동
  };
  return (
    <div className="w-full bg-gray-100 z-10">
      <div className="flex justify-between items-center px-4 py-3">
        {/* 뒤로가기 버튼 */}
        <button className="text-gray-600 hover:text-blue-500">
          <img src={ArrowBackLogo} alt="Home" className="w-6 h-6" />
        </button>
        
        <button
          onClick={() => handleNavigation('/')}
          className="text-gray-600 hover:text-blue-500">
          <img src={Favicon} alt="Home" className="w-6 h-6" />
        </button>

        {/* 공유 버튼 */}
        <button className="text-gray-600 hover:text-blue-500">
          <img src={ShareLogo} alt="Home" className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
