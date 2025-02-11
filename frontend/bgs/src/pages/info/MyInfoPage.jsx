import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../stores/useUserStore";
import { getUser, deleteUser } from "../../api/User"; // ✅ 유저 정보 및 삭제 API
import { getFollowerList, getFollowingList } from "../../api/Follow"; // ✅ 팔로워 & 팔로잉 목록 API
import { getUserPostCount } from "../../api/Feed"; // ✅ 게시물 개수 가져오기 API
import settings from "../../assets/icons/settings.svg";
import myinfo from "../../assets/icons/myinfo.png";
import SignoutIcon from "../../assets/icons/signout.svg";
import { handleLogout } from "../../api/Auth"; // ✅ 로그아웃 API
import PostsTab from "../../components/myinfo/PostsTab"; // ✅ 게시물 탭
import StatsTab from "../../components/myinfo/StatsTab"; // ✅ 통계 탭
import MyGymTab from "../../components/myinfo/MyGymTab"; // ✅ 마이짐 탭
import BottomBar from "../../components/bar/BottomBar"; // ✅ 하단 네비게이션 바
import TopBar from "../../components/bar/TopBar"; // ✅ 상단 네비게이션 바

export default function MyInfoPage() {
  const navigate = useNavigate();
  const { me, setMe } = useUserStore(); // ✅ 현재 로그인한 유저 정보 (Zustand 상태 관리)
  const [activeTab, setActiveTab] = useState("posts"); // ✅ 선택된 탭 상태
  const [weightData, setWeightData] = useState([]); // ✅ 몸무게 변화 데이터
  const [totalWeightData, setTotalWeightData] = useState([]); // ✅ 총 운동량 데이터
  const [workoutFrequency, setWorkoutFrequency] = useState([]); // ✅ 운동 빈도 데이터
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // ✅ 설정 메뉴 상태 (열림/닫힘)
  const [followerCount, setFollowerCount] = useState(0); // ✅ 팔로워 수
  const [followingCount, setFollowingCount] = useState(0); // ✅ 팔로잉 수
  const [postCount, setPostCount] = useState(0); // ✅ 게시물 개수
  const dropdownRef = useRef(null); // ✅ 설정 메뉴 닫기 위한 ref

  // ✅ 유저 정보 & 통계 데이터 가져오기
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await getUser(); // ✅ 로그인된 유저 정보 요청
        console.log("🔹 내 프로필 데이터:", res);
        setMe(res); // ✅ Zustand 상태 업데이트

        // ✅ 팔로워 & 팔로잉 수, 게시물 개수 한 번에 요청
        const [followers, followings, postData] = await Promise.all([
          getFollowerList(),
          getFollowingList(),
          getUserPostCount(res.userId),
        ]);

        setFollowerCount(followers.length); // ✅ 팔로워 수 업데이트
        setFollowingCount(followings.length); // ✅ 팔로잉 수 업데이트
        setPostCount(postData ?? 0); // ✅ 게시물 수 업데이트 (undefined 방지)

        // ✅ 운동 데이터 (더미 데이터 유지)
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
  }, [setMe]);

  // ✅ 설정 메뉴 외부 클릭 시 닫기
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

  if (!me) return <p>로딩 중...</p>;

  // ✅ 회원 탈퇴 기능
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
        {/* ✅ 상단 프로필 섹션 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={me.profileImageUrl || myinfo}
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
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          >
            <img src={settings} alt="설정" />
          </button>
        </div>

        {/* ✅ 탭 네비게이션 (게시물 수 포함) */}
        <div className="flex justify-around">
          {[
            { key: "posts", label: `게시물 (${postCount})` },
            { key: "stats", label: "통계" },
            { key: "myGym", label: "마이짐" },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`py-2 px-4 ${
                activeTab === tab.key
                  ? "border-b-2 border-primary text-gray-800"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ✅ 탭 내용 렌더링 */}
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
