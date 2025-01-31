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
      <div className='m-4'>
        <div className="m-auto mt-4">
          <input
            type="text"
            placeholder="검색"
            className="w-full p-3 border rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5">
          <button
            onClick={() => { navigate("/mygym") }}
            className="flex items-center p-4 bg-white border rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-200"
          >
            <div className="text-left">
              <p className="text-xl font-semibold text-gray-800">마이짐</p>
              <p className="text-lg text-gray-600">바로가기</p>
            </div>
          </button>

          <button
            onClick={() => { navigate("/workoutcreate") }}
            className="flex items-center p-4 bg-white border rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-200"
          >
            <div className="text-left">
              <p className="text-xl font-semibold text-gray-800">일지</p>
              <p className="text-lg text-gray-600">작성하기</p>
            </div>
            <img
              src={camera}
              alt="Camera Icon"
              className="w-12 h-12"
            />
          </button>

          <button
            onClick={() => { navigate("/signup") }}
            className="flex items-center p-4 bg-white border rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-200"
          >
            <div className="text-left">
              <p className="text-xl font-semibold text-gray-800">로그인</p>
              <p className="text-lg text-gray-600">바로 하러가기</p>
            </div>
          </button>

          <button
            onClick={() => { navigate("/feed") }}
            className="flex items-center p-4 bg-white border rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-200"
          >
            <div className="text-left">
              <p className="text-xl font-semibold text-gray-800">피드</p>
              <p className="text-lg text-gray-600">보러가기</p>
            </div>
          </button>
        </div>
      </div>
      <BottomBar />
    </>
  );
};
