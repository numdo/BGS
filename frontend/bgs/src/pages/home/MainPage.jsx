import React, { useRef, useState, useEffect } from "react";
import BottomBar from "../../components/bar/BottomBar";
import TopBar from "../../components/bar/TopBar";
import camera from "../../assets/images/camera.png";
import AttendanceGrid from "../../components/attendance/AttendanceGrid";
import { useNavigate } from "react-router-dom";
import { handleLogout } from "../../api/Auth";
import Shortcut from "../../components/home/Shortcut";

export default function MainPage() {
  const navigate = useNavigate();
  const attendanceGridRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 로그인 상태 확인 (localStorage에 accessToken 존재 여부)
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  // 로그아웃 후 로그인 상태 갱신
  const onLogout = async () => {
    await handleLogout(navigate);
    setIsLoggedIn(false);
  };

  const handleAttendanceCheck = () => {
    if (
      attendanceGridRef.current &&
      attendanceGridRef.current.handleCheckAttendance
    ) {
      attendanceGridRef.current.handleCheckAttendance();
    }
  };

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
          <Shortcut
            onClick={() => {
              if (isLoggedIn) {
                onLogout();
              } else {
                navigate("/login");
              }
            }}
            className="flex items-center p-4 bg-white border rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <div className="text-left">
              <p className="text-xl font-semibold text-gray-800">
                {isLoggedIn ? "로그아웃" : "로그인"}
              </p>
              <p className="text-lg text-gray-600">
                {isLoggedIn ? "하기" : "하러가기"}
              </p>
            </div>
          </Shortcut>

          <button
            onClick={() => navigate("/mygym")}
            className="flex items-center p-4 bg-white border rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <div className="text-left">
              <p className="text-xl font-semibold text-gray-800">마이짐</p>
              <p className="text-lg text-gray-600">바로가기</p>
            </div>
            <div></div>
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

          <button
            onClick={() => navigate("/admin-item")}
            className="flex items-center p-4 bg-white border rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <div className="text-left">
              <p className="text-xl font-semibold text-gray-800">아이템</p>
              <p className="text-lg text-gray-600">관리하기</p>
            </div>
          </button>

          <button
            onClick={handleAttendanceCheck}
            className="flex items-center p-4 bg-white border rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <div className="text-left">
              <p className="text-xl font-semibold text-gray-800">출석 체크</p>
              <p className="text-lg text-gray-600">하기</p>
            </div>
          </button>
        </div>

        <div className="mt-6">
          <AttendanceGrid ref={attendanceGridRef} />
        </div>
      </div>

      <BottomBar />
    </>
  );
}
