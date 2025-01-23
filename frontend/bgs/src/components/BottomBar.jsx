import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import HomeLogo from './../assets/Home.png'
import FeedLogo from './../assets/Feed.png'
import MyGymLogo from './../assets/MyGym.png'
import WorkoutLogo from './../assets/Workout.png'
import MyInfo from './../assets/MyInfo.png'

const BottomBar = () => {
  const navigate = useNavigate(); // useNavigate 훅 사용

  const handleNavigation = (url) => {
    navigate(url); // url로 이동
  };
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-around items-center py-2">
        <button
          onClick={() => handleNavigation('/')}
          className="flex flex-col items-center text-gray-600 hover:text-blue-500">
          <img src={HomeLogo} alt="Home" className="w-6 h-6" />
          <span className="text-sm">홈</span>
        </button>
        <button 
          onClick={() => handleNavigation('/workout')}
          className="flex flex-col items-center text-gray-600 hover:text-blue-500">
          <img src={WorkoutLogo} alt="Workout" className="w-6 h-6" />
          <span className="text-sm">운동일지</span>
        </button>
        <button
          onClick={() => handleNavigation('/mygym')}
          className="flex flex-col items-center text-gray-600 hover:text-blue-500">
          <img src={MyGymLogo} alt="MyGym" className="w-5 h-6" />
          <span className="text-sm">마이짐</span>
        </button>
        <button
          onClick={() => handleNavigation('/feed')}
          className="flex flex-col items-center text-gray-600 hover:text-blue-500">
          <img src={FeedLogo} alt="Feed" className="w-5 h-5" />
          <span className="text-sm">피드</span>
        </button>
        <button
          onClick={() => handleNavigation('/myinfo')}
          className="flex flex-col items-center text-gray-600 hover:text-blue-500">
          <img src={MyInfo} alt="MyInfo" className="w-6 h-6" />
          <span className="text-sm">내정보</span>
        </button>
      </div>
    </div>
  );
};

export default BottomBar;