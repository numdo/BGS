import BottomBar from "../../components/bar/BottomBar";
import TopBar from "../../components/bar/TopBar";
import { useState, useEffect } from "react";
import useUserStore from "../../stores/useUserStore";
import { getUser } from "../../api/User";
import MyGymRoomView from "../../components/mygym/MyGymRoomView";
export default function MyInfoPage() {
  const { user, setUser } = useUserStore();
  useEffect(() => {
    getUser().then((res) => setUser(res));
  }, []);
  useEffect(() => {
    console.log(user);
  }, [user]);
  console.log(localStorage.getItem("accessToken"));
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
            src={user.profileImageUrl}
            alt="Profile img Pro file img Profile img Profile img"
            className="rounded-full h-24 w-24"
          />
          <div className="ml-6 flex-1">
            <h2 className="mt-4 text-2xl font-semibold text-gray-800">
              {user.nickname}
            </h2>
            <p className="text-gray-600 mt-2">{user.introduce}</p>
          </div>
          <div className="flex justify-between items-center">
            <button className="bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-200">
              팔로우
            </button>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="border-b mb-4">
          <div className="flex justify-around">
            <button
              className={`py-2 px-4 ${
                activeTab === "posts"
                  ? "border-b-2 border-gray-800 text-gray-800"
                  : "text-gray-500"
              }`}
              onClick={() => handleTabClick("posts")}
            >
              게시물 탭
            </button>
            <button
              className={`py-2 px-4 ${
                activeTab === "stats"
                  ? "border-b-2 border-gray-800 text-gray-800"
                  : "text-gray-500"
              }`}
              onClick={() => handleTabClick("stats")}
            >
              통계 탭
            </button>
            <button
              className={`py-2 px-4 ${
                activeTab === "myGym"
                  ? "border-b-2 border-gray-800 text-gray-800"
                  : "text-gray-500"
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
          {activeTab === "myGym" && <MyGymRoomView />}
        </div>
      </div>
      <div className="m-10">
        <div>생일 : {user.birthDate}</div>
        <div>성별 : {user.sex}</div>
        <div>키 : {user.height}</div>
        <div>몸무게 : {user.weight}</div>
        <div>불끈도 : {user.degree}</div>
        <div>3대 합 : {user.totalWeight}</div>
        <div>연속 출석 일수 : {user.strickAttendance}</div>
        <div>마지막 출석 일자 : {user.lastAttendance}</div>
        <div>코인 : {user.coin}</div>
      </div>
      <BottomBar />
    </>
  );
}
