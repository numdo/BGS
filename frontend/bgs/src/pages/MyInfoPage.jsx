import React from 'react';
import BottomBar from '../components/BottomBar';
import TopBar from '../components/TopBar';
import { useState } from 'react';
export default function MyInfoPage() {
  const [activeTab, setActiveTab] = useState("posts"); // 현재 활성화된 탭
  const [showFollowers, setShowFollowers] = useState(false); // 팔로워 모달
  const [showFollowing, setShowFollowing] = useState(false); // 팔로잉 모달
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
  return (
    <>
      <TopBar />
      <div className="p-6 max-w-3xl mx-auto">
        {/* 상단 프로필 섹션 */}
        <div className="flex items-center mb-6">
          <img
            src="https://picsum.photos/100/100"
            alt="Profile"
            className="rounded-full h-24 w-24"
          />
          <div className="ml-6 flex-1">

            <h2 className="mt-4 text-2xl font-semibold text-gray-800">손재민</h2>
            <p className="text-gray-500">Web Developer</p>
            <p className="text-gray-600 mt-2">
              수완식당 일주일에 적어도 한번은 가야지
            </p>
          </div>
          <div className="flex justify-between items-center">
            <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
              Follow
            </button>
          </div>
        </div>

        {/* 팔로워/팔로잉 섹션 */}
        <div className="flex justify-around text-center mb-6">
          <div>
            <p
              className="text-lg font-semibold text-blue-500 cursor-pointer"
              onClick={() => setShowFollowers(true)}
            >
              120
            </p>
            <p className="text-gray-500">Followers</p>
          </div>
          <div>
            <p
              className="text-lg font-semibold text-blue-500 cursor-pointer"
              onClick={() => setShowFollowing(true)}
            >
              80
            </p>
            <p className="text-gray-500">Following</p>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="border-b mb-4">
          <div className="flex justify-around">
            <button
              className={`py-2 px-4 ${activeTab === "posts" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"
                }`}
              onClick={() => handleTabClick("posts")}
            >
              게시물 탭
            </button>
            <button
              className={`py-2 px-4 ${activeTab === "stats" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"
                }`}
              onClick={() => handleTabClick("stats")}
            >
              통계 탭
            </button>
            <button
              className={`py-2 px-4 ${activeTab === "myGym" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"
                }`}
              onClick={() => handleTabClick("myGym")}
            >
              마이짐 탭
            </button>
          </div>
        </div>

        {/* 탭 내용 */}
        <div className="p-4">
          {activeTab === "posts" && <p>게시물 탭입니다</p>}
          {activeTab === "stats" && <p>통계 탭입니다</p>}
          {activeTab === "myGym" && <p>마이짐 탭입니다</p>}
        </div>

        {/* 팔로워/팔로잉 모달 */}
        {showFollowers && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Followers</h3>
              <ul>
                <li>Follower 1</li>
                <li>Follower 2</li>
                <li>Follower 3</li>
              </ul>
              <button
                className="mt-4 bg-red-500 text-white py-2 px-4 rounded-lg"
                onClick={() => setShowFollowers(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
        {showFollowing && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Following</h3>
              <ul>
                <li>Following 1</li>
                <li>Following 2</li>
                <li>Following 3</li>
              </ul>
              <button
                className="mt-4 bg-red-500 text-white py-2 px-4 rounded-lg"
                onClick={() => setShowFollowing(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      <BottomBar />
    </>
  );
};