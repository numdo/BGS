import React from 'react';
import BottomBar from '../components/BottomBar';
import TopBar from '../components/TopBar';
import camera from '../assets/camera.png'
import { useNavigate } from 'react-router-dom';
export default function MainPage() {
  const navigate = useNavigate()
  return (
    <>
      <TopBar />
      <button
        onClick={() => { navigate("/workoutcreate") }}
        className="m-auto mt-10 flex items-center p-4 bg-white border rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-200"
      >
        <div className="text-left">
          <p className="text-xl font-semibold text-gray-800">일지</p>
          <p className="text-lg text-gray-600">바로 작성하기</p>
        </div>
        <img
          src={camera} // 이미지 URL을 적절히 교체하세요
          alt="Camera Icon"
          className="w-12 h-12"
        />
      </button>
      <button
        onClick={() => { navigate("/signup") }}
        className="m-auto mt-10 flex items-center p-4 bg-white border rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-200"
      >
        <div className="text-left">
          <p className="text-xl font-semibold text-gray-800">로그인</p>
          <p className="text-lg text-gray-600">바로 하러가기</p>
        </div>
      </button>
      <BottomBar />
    </>
  );
};
