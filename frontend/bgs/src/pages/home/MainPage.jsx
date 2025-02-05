import React from 'react';
import { useEffect } from 'react';
import BottomBar from '../../components/bar/BottomBar';
import TopBar from '../../components/bar/TopBar';
import camera from '../../assets/images/camera.png'
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { handleLogout } from "../../utils/auth"; // ✅ handleLogout 함수 불러오기
export default function MainPage() {
  const navigate = useNavigate()
  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // JWT 토큰을 디코딩
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000; // 현재 시간 (초 단위)

      // 만약 토큰이 만료되었으면 로그인 페이지로 이동
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem('accessToken'); // 만료된 토큰 삭제
        navigate('/login');
      }
    } catch (error) {
      console.error('토큰 디코딩 오류:', error);
      navigate('/login');
    }
  }, [navigate]);
  return (
    <>
      <TopBar />
      <div className="m-4">
        <div className="m-auto mt-4">
          <input
            type="text"
            placeholder="검색"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5">
          <button
            onClick={() => navigate("/signup")}
            className="flex items-center p-4 bg-white border rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <div className="text-left">
              <p className="text-xl font-semibold text-gray-800">회원가입</p>
              <p className="text-lg text-gray-600">바로 하러가기</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/login")}
            className="flex items-center p-4 bg-white border rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <div className="text-left">
              <p className="text-xl font-semibold text-gray-800">로그인</p>
              <p className="text-lg text-gray-600">하러가기</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/mygym")}
            className="flex items-center p-4 bg-white border rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <div className="text-left">
              <p className="text-xl font-semibold text-gray-800">마이짐</p>
              <p className="text-lg text-gray-600">바로가기</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/workoutcreate")}
            className="flex items-center p-4 bg-white border rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <div className="text-left">
              <p className="text-xl font-semibold text-gray-800">일지</p>
              <p className="text-lg text-gray-600">작성하기</p>
            </div>
            <img src={camera} alt="Camera Icon" className="w-12 h-12" />
          </button>

          <button
            onClick={() => navigate("/feed")}
            className="flex items-center p-4 bg-white border rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <div className="text-left">
              <p className="text-xl font-semibold text-gray-800">피드</p>
              <p className="text-lg text-gray-600">보러가기</p>
            </div>
          </button>
        </div>
      </div>

      {/* ✅ 로그아웃 버튼 (하단에 배치) */}
      <div className="flex justify-center mt-10 mb-20">
        <button
          onClick={() => handleLogout(navigate)} // ✅ handleLogout 함수 실행
          className="w-1/2 px-4 py-3 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600 transition-all"
        >
          로그아웃
        </button>
      </div>

      <BottomBar />
    </>
  );
}
