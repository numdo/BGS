import { useState, useEffect, useRef } from "react";
import { getFollowerList, getFollowingList } from "../../api/Follow";
import DefaultProfileImage from "../../assets/icons/myinfo.png";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../../components/bar/TopBar";
import BottomBar from "../../components/bar/BottomBar";

export default function FollowerFollowingListPage() {
  const { type } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(
    type === "following" ? "following" : "followers"
  );
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const containerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [followersData, followingData] = await Promise.all([
          getFollowerList(),
          getFollowingList(),
        ]);
        setFollowers(followersData);
        setFollowing(followingData);
      } catch (error) {
        console.error("❌ 팔로워/팔로잉 리스트 불러오기 실패:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.transform =
        activeTab === "followers" ? "translateX(0%)" : "translateX(-100%)";
    }
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/follow/${tab}`);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const moveDistance = touchStartX.current - touchEndX.current;

    if (moveDistance > 50) {
      setActiveTab("following");
      navigate("/follow/following");
    } else if (moveDistance < -50) {
      setActiveTab("followers");
      navigate("/follow/followers");
    }
  };

  return (
    <>
      <TopBar />
      <div
        className="max-w-lg mx-auto p-4 h-screen flex flex-col overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* ✅ 상단 네비게이션 */}
        <div className="flex justify-around border-b-2 pb-2">
          <button
            className={`w-1/2 text-center py-2 font-semibold ${
              activeTab === "followers"
                ? "border-b-4 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => handleTabChange("followers")}
          >
            팔로워 ({followers.length})
          </button>
          <button
            className={`w-1/2 text-center py-2 font-semibold ${
              activeTab === "following"
                ? "border-b-4 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => handleTabChange("following")}
          >
            팔로잉 ({following.length})
          </button>
        </div>

        {/* ✅ 슬라이드 컨테이너 */}
        <div className="relative flex-grow overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out w-full"
            style={{ width: "200%" }}
            ref={containerRef}
          >
            {/* ✅ 팔로워 리스트 (왼쪽 정렬) */}
            <div className="w-full flex-shrink-0 flex flex-col items-start px-4 mt-4">
              {followers.length > 0 ? (
                followers.map((user) => (
                  <UserItem key={user.userId} user={user} />
                ))
              ) : (
                <p className="text-gray-500 text-lg mt-10 w-full text-left">
                  팔로워가 없습니다.
                </p>
              )}
            </div>

            {/* ✅ 팔로잉 리스트 (왼쪽 정렬) */}
            <div className="w-full flex-shrink-0 flex flex-col items-start px-4 mt-4">
              {following.length > 0 ? (
                following.map((user) => (
                  <UserItem key={user.userId} user={user} />
                ))
              ) : (
                <p className="text-gray-500 text-lg mt-10 w-full text-left">
                  팔로잉이 없습니다.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <BottomBar />
    </>
  );
}

// ✅ 개별 유저 아이템 컴포넌트
function UserItem({ user }) {
  const navigate = useNavigate();

  return (
    <div
      className="flex items-center p-4 border-b cursor-pointer hover:bg-gray-100 w-full max-w-md"
      onClick={() => navigate(`/profile/${user.userId}`)}
    >
      <img
        src={user.profileImageUrl || DefaultProfileImage}
        alt="프로필"
        className="w-12 h-12 rounded-full"
      />
      <div className="ml-4 w-full overflow-hidden">
        <p className="text-lg font-semibold truncate">{user.nickname}</p>
        <p className="text-gray-500 text-sm truncate">
          {user.introduce || "소개 없음"}
        </p>
      </div>
    </div>
  );
}
