import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { getUser } from "../../api/User";
import { follow, unfollow, getFollowingList } from "../../api/Follow";
import { getUserPostCount } from "../../api/Feed"; // ✅ 게시물 개수 가져오기 API
import PostsTab from "../../components/myinfo/PostsTab";
import MyGymTab from "../../components/myinfo/MyGymTab";
import StatsTab from "../../components/myinfo/StatsTab"; // ✅ 통계 탭 추가!
import DefaultProfileImage from "../../assets/icons/myinfo.png";
import BottomBar from "../../components/bar/BottomBar";
import TopBar from "../../components/bar/TopBar";

export default function UserInfoPage() {
  const { userId } = useParams();

  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("myGym");
  const [activeIndex, setActiveIndex] = useState(0);
  const [postCount, setPostCount] = useState(0);

  const containerRef = useRef(null);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);

  // ✅ 유저 정보 가져오기 (프로필 & 게시물 개수)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await getUser(userId);
        setUser(res);

        const [followingList, postData] = await Promise.all([
          getFollowingList(),
          getUserPostCount(userId),
        ]);

        setIsFollowing(followingList.some((f) => f.userId === res.userId));
        setPostCount(postData ?? 0);
      } catch (error) {
        console.error("❌ 친구 프로필 가져오기 실패:", error);
      }
    };

    fetchUserData();
  }, [userId]);

  // ✅ 팔로우 / 언팔로우 처리 함수
  const handleFollowToggle = async () => {
    if (!user?.userId) return;

    const previousState = isFollowing;
    setIsFollowing(!isFollowing);

    try {
      isFollowing ? await unfollow(user.userId) : await follow(user.userId);
    } catch (error) {
      console.error("❌ 팔로우 변경 중 오류 발생:", error);
      setIsFollowing(previousState);
    }
  };

  // ✅ 터치 이벤트 (스와이프)
  const handleTouchStart = (e) => setStartX(e.touches[0].clientX);
  const handleTouchMove = (e) => setTranslateX(e.touches[0].clientX - startX);
  const handleTouchEnd = () => {
    if (translateX < -50 && activeIndex < 2) moveTab(activeIndex + 1);
    else if (translateX > 50 && activeIndex > 0) moveTab(activeIndex - 1);
    setTranslateX(0);
  };

  // ✅ 탭 변경 함수
  const moveTab = (index) => {
    setActiveIndex(index);
    const tabKeys = ["myGym", "stats", "posts"];
    setActiveTab(tabKeys[index]);
  };

  if (!user) return <p>로딩 중...</p>;

  return (
    <>
      <TopBar />
      <div className="p-6 max-w-3xl mx-auto">
        {/* ✅ 상단 프로필 섹션 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <img
              src={user.profileImageUrl || DefaultProfileImage}
              alt="Profile"
              className="rounded-full h-20 w-20"
            />
            <div className="ml-3">
              <h2 className="text-2xl font-semibold text-gray-800">
                {user.nickname}
              </h2>
              {/* ✅ 자기소개 추가 (최대 2줄) */}
              <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                {user.introduce || "자기소개가 없습니다."}
              </p>
            </div>
          </div>
          {/* ✅ 팔로우 / 언팔로우 버튼 */}
          <button
            className={`py-3 px-2 rounded-md whitespace-nowrap ${
              isFollowing
                ? "bg-gray-400 text-sm text-white"
                : "bg-primary text-sm text-white"
            }`}
            onClick={handleFollowToggle}
          >
            {isFollowing ? "언팔로우" : "팔로우"}
          </button>
        </div>

        {/* ✅ 탭 네비게이션 */}
        <div className="relative mt-4 border-b border-gray-200">
          <div className="flex justify-between relative">
            {[
              { key: "myGym", label: "마이짐" },
              { key: "stats", label: "통계" },
              { key: "posts", label: `게시물 ${postCount}` },
            ].map((tab, index) => (
              <button
                key={tab.key}
                className={`flex-1 text-center py-2 transition ${
                  activeTab === tab.key
                    ? "text-gray-900 font-semibold"
                    : "text-gray-500"
                }`}
                onClick={() => moveTab(index)}
              >
                {tab.label}
              </button>
            ))}
            {/* 🔥 하이라이트 바 */}
            <div
              className="absolute bottom-0 left-0 h-[2px] bg-primary transition-transform duration-300 ease-in-out"
              style={{
                width: "33%",
                transform: `translateX(${activeIndex * 100}%)`,
              }}
            ></div>
          </div>
        </div>

        {/* ✅ 탭 내용 */}
        <div className="relative w-full overflow-hidden mt-4">
          <div
            ref={containerRef}
            className="flex w-full transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(calc(${
                activeIndex * -100
              }% + ${translateX}px))`,
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-full flex-shrink-0 max-w-full overflow-hidden">
              <MyGymTab friendId={user.userId} />
            </div>
            <div className="w-full flex-shrink-0">
              <StatsTab />
            </div>
            <div className="w-full flex-shrink-0">
              <PostsTab userId={user.userId} />
            </div>
          </div>
        </div>
      </div>
      <BottomBar />
    </>
  );
}
