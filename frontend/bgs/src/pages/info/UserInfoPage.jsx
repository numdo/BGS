import BottomBar from "../../components/bar/BottomBar";
import TopBar from "../../components/bar/TopBar";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getUser } from "../../api/User";
import { follow, unfollow, getFollowingList } from "../../api/Follow";
import PostsTab from "../../components/myinfo/PostsTab";
import StatsTab from "../../components/myinfo/StatsTab";
import MyGymTab from "../../components/myinfo/MyGymTab";
import DefaultProfileImage from "../../assets/icons/myinfo.png";

export default function UserInfoPage() {
  const { userId } = useParams(); // URL에서 userId 가져오기
  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [weightData, setWeightData] = useState([]);
  const [totalWeightData, setTotalWeightData] = useState([]);
  const [workoutFrequency, setWorkoutFrequency] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await getUser(userId); // ✅ 친구 프로필 정보 가져오기
        console.log("🔹 친구 프로필 데이터:", res);
        setUser(res);

        // ✅ 팔로우 상태 확인
        const followingList = await getFollowingList();
        const isUserFollowing = followingList.some(
          (f) => f.userId === res.userId
        );
        setIsFollowing(isUserFollowing);

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
        console.error("❌ 친구 프로필 가져오기 실패:", error);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleFollowToggle = async () => {
    if (!user?.userId) {
      console.error("❌ 유저 ID가 존재하지 않습니다.");
      return;
    }

    const previousState = isFollowing; // 이전 상태 저장
    setIsFollowing(!isFollowing); // ✅ UI 즉시 반영

    try {
      if (isFollowing) {
        await unfollow(user.userId);
        console.log(`언팔로우 성공: ${user.userId}`);
      } else {
        await follow(user.userId);
        console.log(`팔로우 성공: ${user.userId}`);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("❌ 팔로우 변경 중 오류 발생:", error);
      setIsFollowing(previousState); // ✅ 실패하면 원래 상태로 롤백
    }
  };

  if (!user) return <p>로딩 중...</p>;

  return (
    <>
      <TopBar />
      <div className="p-6 max-w-3xl mx-auto">
        {/* 상단 프로필 섹션 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <img
              src={user.profileImageUrl || DefaultProfileImage} // ✅ 기본 이미지 추가
              alt="Profile"
              className="rounded-full h-24 w-24"
            />
            <div className="ml-6">
              <h2 className="mt-4 text-2xl font-semibold text-gray-800">
                {user.nickname}
              </h2>
              <p className="text-gray-600 mt-2">{user.introduce}</p>
            </div>
          </div>
          {/* ✅ 팔로우 버튼 */}
          <button
            className={`py-2 px-4 rounded-lg font-semibold transition ${
              isFollowing
                ? "bg-gray-400 text-white hover:bg-gray-500"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            onClick={handleFollowToggle}
          >
            {isFollowing ? "언팔로우" : "팔로우"}
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="border-b mb-4 flex justify-around">
          {["posts", "stats", "myGym"].map((tab) => (
            <button
              key={tab}
              className={`py-2 px-4 ${
                activeTab === tab
                  ? "border-b-2 border-gray-800 text-gray-800"
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
            <PostsTab userId={user.userId} nickname={user.nickname} />
          )}
          {activeTab === "stats" && (
            <StatsTab
              weightData={weightData}
              totalWeightData={totalWeightData}
              workoutFrequency={workoutFrequency}
            />
          )}
          {activeTab === "myGym" && <MyGymTab friendId={user.userId} />}
        </div>
      </div>

      <BottomBar />
    </>
  );
}
