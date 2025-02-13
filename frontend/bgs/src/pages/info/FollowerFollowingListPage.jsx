import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFollowerList, getFollowingList } from "../../api/Follow";
import TopBar from "../../components/bar/TopBar";
import BottomBar from "../../components/bar/BottomBar";
import UserList from "../../components/follow/UserList";

export default function FollowerFollowingListPage() {
  const { type } = useParams();
  const navigate = useNavigate();
  const fetchedData = useRef({ followers: [], following: [] });

  const [activeTab, setActiveTab] = useState(
    type === "following" ? "following" : "followers"
  );
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const containerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (
          !fetchedData.current.followers.length ||
          !fetchedData.current.following.length
        ) {
          const [followersData, followingData] = await Promise.all([
            getFollowerList(),
            getFollowingList(),
          ]);
          fetchedData.current.followers = followersData;
          fetchedData.current.following = followingData;
        }
        setFollowers(fetchedData.current.followers);
        setFollowing(fetchedData.current.following);
      } catch (error) {
        console.error("❌ 팔로워/팔로잉 리스트 불러오기 실패:", error);
      } finally {
        setIsLoading(false);
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
    navigate(`/follow/${tab}`, { replace: true });
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const moveDistance = touchStartX.current - touchEndX.current;

    if (moveDistance > 50 && activeTab !== "following") {
      handleTabChange("following");
    } else if (moveDistance < -50 && activeTab !== "followers") {
      handleTabChange("followers");
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
        {/* ✅ 상단 네비게이션 (게시물 수 포함) */}
        <div className="flex justify-around border-b-2 pb-2">
          <button
            className={`w-1/2 text-center py-2 font-semibold ${
              activeTab === "followers"
                ? "border-b-4 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => handleTabChange("followers")}
          >
            팔로워 <span className="font-bold">({followers.length})</span>
          </button>
          <button
            className={`w-1/2 text-center py-2 font-semibold ${
              activeTab === "following"
                ? "border-b-4 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => handleTabChange("following")}
          >
            팔로잉 <span className="font-bold">({following.length})</span>
          </button>
        </div>

        {/* ✅ 로딩 중 메시지를 화면 상단에 배치 */}
        {isLoading && (
          <div className="w-full text-center text-gray-500 text-lg mt-20">
            로딩 중...
          </div>
        )}

        {/* ✅ 슬라이드 컨테이너 */}
        <div className="relative flex-grow overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out w-full"
            ref={containerRef}
          >
            {!isLoading && (
              <>
                <div className="w-full flex-shrink-0 flex justify-center">
                  <UserList
                    users={followers}
                    emptyMessage="팔로워가 없습니다."
                  />
                </div>
                <div className="w-full flex-shrink-0 flex justify-center">
                  <UserList
                    users={following}
                    emptyMessage="팔로잉이 없습니다."
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <BottomBar />
    </>
  );
}
