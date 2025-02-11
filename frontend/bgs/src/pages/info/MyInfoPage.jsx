import BottomBar from "../../components/bar/BottomBar";
import TopBar from "../../components/bar/TopBar";
import { useState, useEffect, useRef } from "react";
import useUserStore from "../../stores/useUserStore";
import { getUser, deleteUser } from "../../api/User";
import { getFollowerList, getFollowingList } from "../../api/Follow";
import settings from "../../assets/icons/settings.svg";
import PostsTab from "../../components/myinfo/PostsTab";
import StatsTab from "../../components/myinfo/StatsTab";
import MyGymTab from "../../components/myinfo/MyGymTab";
import DefaultProfileImage from "../../assets/icons/person.svg";
import SignoutIcon from "../../assets/icons/Signout.svg";
import { handleLogout } from "../../api/Auth";
import { useNavigate } from "react-router-dom";

export default function MyInfoPage() {
  const navigate = useNavigate();
  const { me, setMe } = useUserStore(); // ✅ setMe를 가져와야 함
  const [activeTab, setActiveTab] = useState("posts");
  const [weightData, setWeightData] = useState([]);
  const [totalWeightData, setTotalWeightData] = useState([]);
  const [workoutFrequency, setWorkoutFrequency] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await getUser(); // ✅ 내 프로필 정보 가져오기
        console.log("🔹 내 프로필 데이터:", res);
        setMe(res); // ✅ setUser 대신 setMe 사용

        // ✅ 팔로워 & 팔로잉 수 가져오기
        const followers = await getFollowerList();
        const followings = await getFollowingList();
        setFollowerCount(followers.length);
        setFollowingCount(followings.length);

        setWeightData([
          { date: "01-01", weight: res.weight - 3 },
          { date: "01-10", weight: res.weight - 2 },
          { date: "01-20", weight: res.weight - 1 },
          { date: "02-01", weight: res.weight },
        ]);
        setTotalWeightData([
          { date: "01-01", totalWeight: res.totalWeight - 10 },
          { date: "01-10", totalWeight: res.totalWeight - 5 },
          { date: "01-20", totalWeight: res.totalWeight },
          { date: "02-01", totalWeight: res.totalWeight + 5 },
        ]);
        setWorkoutFrequency([
          { day: "월", count: 3 },
          { day: "화", count: 2 },
          { day: "수", count: 4 },
          { day: "목", count: 1 },
          { day: "금", count: 3 },
          { day: "토", count: 5 },
          { day: "일", count: 2 },
        ]);
      } catch (error) {
        console.error("❌ 내 프로필 가져오기 실패:", error);
      }
    };

    fetchUserData();
  }, [setMe]); // ✅ setUser -> setMe로 변경

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  if (!me) return <p>로딩 중...</p>; // ✅ user -> me로 변경

  const handleDeleteUser = () => {
    const isConfirmed = window.confirm("정말로 탈퇴하시겠습니까?");
    if (isConfirmed) {
      deleteUser();
      alert("회원 탈퇴가 완료되었습니다");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/login");
    }
  };

  return (
    <>
      <TopBar />
      <div className="px-6 pt-2 max-w-3xl mx-auto">
        {/* 상단 프로필 섹션 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={me.profileImageUrl || DefaultProfileImage} // ✅ user -> me로 변경
              alt="Profile"
              className="rounded-full h-24 w-24"
            />
            <div className="ml-6">
              <h2 className="mt-4 text-2xl font-semibold text-gray-800">
                {me.nickname}
              </h2>
              <p className="text-gray-600 mt-2">{me.introduce}</p>
              {/* ✅ 팔로워 & 팔로잉 수 */}
              <div className="flex space-x-4 mt-2">
                <div
                  className="cursor-pointer"
                  onClick={() => navigate("/follow/followers")}
                >
                  팔로워 <span className="font-bold">{followerCount}</span>
                </div>
                <div
                  className="cursor-pointer"
                  onClick={() => navigate("/follow/following")}
                >
                  팔로잉 <span className="font-bold">{followingCount}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            ref={dropdownRef}
            onClick={() => {
              setIsSettingsOpen(!isSettingsOpen);
            }}
          >
            <img src={settings} alt="설정" />
          </button>
          {isSettingsOpen && (
            <div className="absolute right-3 top-32 w-30 rounded-md bg-gray-100 border border-gray-200 ring-1 ring-black ring-opacity-5 z-10">
              <div className="" role="menu">
                <div
                  onClick={() => {
                    navigate("/myinfoedit");
                  }}
                  className="hover:bg-gray-100 p-2"
                >
                  <p className="inline-block align-middle">프로필 편집</p>
                </div>
                <div
                  onClick={() => handleLogout(navigate)} // ✅ handleLogout 함수 실행
                  className="hover:bg-gray-100 p-2 border-b border-gray-200"
                >
                  <img
                    src={SignoutIcon}
                    alt="signout"
                    className="inline-block align-middle mr-2"
                  />
                  <p className="inline-block align-middle">로그아웃</p>
                </div>
                <div
                  onClick={() => {
                    handleDeleteUser();
                  }}
                  className="text-danger hover:bg-gray-100 p-2"
                >
                  <p className="inline-block align-middle">회원탈퇴</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex justify-around">
          {["posts", "stats", "myGym"].map((tab) => (
            <button
              key={tab}
              className={`py-2 px-4 ${
                activeTab === tab
                  ? "border-b-2 border-primary text-gray-800"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "posts" ? "게시물" : tab === "stats" ? "통계" : "마이짐"}
            </button>
          ))}
        </div>

        {/* 탭 내용 렌더링 */}
        <div className="p-4">
          {activeTab === "posts" && (
            <PostsTab userId={me.userId} nickname={me.nickname} />
          )}
          {activeTab === "stats" && (
            <StatsTab
              weightData={weightData}
              totalWeightData={totalWeightData}
              workoutFrequency={workoutFrequency}
            />
          )}
          {activeTab === "myGym" && <MyGymTab friendId={me.userId} />}
        </div>
      </div>

      <BottomBar />
    </>
  );
}
