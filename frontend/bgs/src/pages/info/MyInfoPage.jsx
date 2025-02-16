import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../stores/useUserStore";
import { getUser } from "../../api/User"; // ✅ 유저 정보 API
import { getFollowerList, getFollowingList } from "../../api/Follow"; // ✅ 팔로워 & 팔로잉 목록 API
import { getUserPostCount } from "../../api/Feed"; // ✅ 게시물 개수 가져오기 API
import myinfo from "../../assets/icons/myinfo.png";
import PostsTab from "../../components/myinfo/PostsTab"; // ✅ 게시물 탭
import StatsTab from "../../components/myinfo/StatsTab"; // ✅ 통계 탭
import MyGymTab from "../../components/myinfo/MyGymTab"; // ✅ 마이짐 탭
import BottomBar from "../../components/bar/BottomBar"; // ✅ 하단 네비게이션 바
import TopBar from "../../components/bar/TopBar"; // ✅ 상단 네비게이션 바

export default function MyInfoPage() {
  const navigate = useNavigate();
  const { me, setMe } = useUserStore();
  const [activeTab, setActiveTab] = useState("myGym");
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postCount, setPostCount] = useState(0);

  // 스와이프 관련 상태
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await getUser();
        setMe(res);

        const [followers, followings, postData] = await Promise.all([
          getFollowerList(),
          getFollowingList(),
          getUserPostCount(res.userId),
        ]);

        setFollowerCount(followers.length);
        setFollowingCount(followings.length);
        setPostCount(postData ?? 0);
      } catch (error) {
        console.error("❌ 내 프로필 가져오기 실패:", error);
      }
    };

    fetchUserData();
  }, [setMe]);

  // 터치 시작
  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
  };

  // 터치 이동 (실시간으로 translateX 변경)
  const handleTouchMove = (e) => {
    const deltaX = e.touches[0].clientX - startX;
    setTranslateX(deltaX);
  };

  // 터치 종료 (스와이프 판별)
  const handleTouchEnd = () => {
    if (translateX < -50 && activeIndex < 2) {
      moveTab(activeIndex + 1);
    } else if (translateX > 50 && activeIndex > 0) {
      moveTab(activeIndex - 1);
    }
    setTranslateX(0);
  };

  // 탭 이동 함수
  const moveTab = (index) => {
    setActiveIndex(index);
    const tabKeys = ["myGym", "stats", "posts"];
    setActiveTab(tabKeys[index]);
  };

  return (
    <>
      <TopBar />
      <div className="px-6 pt-4 max-w-3xl mx-auto">
        {/* ✅ 상단 프로필 섹션 */}
        <div className="flex items-center justify-between">
          {/* 프로필 이미지 */}
          <img
            src={me.profileImageUrl || myinfo}
            alt="Profile"
            className="rounded-full h-20 w-20"
          />

          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-gray-800">
              {me.nickname}
            </h2>
            <p className="text-gray-600 text-sm mt-1">{me.introduction}</p>
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

          {/* 상세정보 버튼 */}
          <button
            onClick={() => navigate("/myinfoview")}
            className="px-3 py-2 text-sm text-white bg-primary rounded-md whitespace-nowrap"
          >
            상세정보
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
            {/* 🔥 슬라이딩 애니메이션이 적용된 하이라이트 바 */}
            <div
              className="absolute bottom-0 left-0 h-[2px] bg-primary transition-transform duration-300 ease-in-out"
              style={{
                width: "33%", // 각 탭 크기에 맞게 설정
                transform: `translateX(${activeIndex * 100}%)`, // 부드러운 이동 효과
              }}
            ></div>
          </div>
        </div>

        {/* ✅ 탭 내용 영역 */}
        <div className="relative w-full overflow-hidden mt-4">
          {/* 슬라이드 컨테이너 */}
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
            {/* MyGymTab을 부모 크기에 맞게 조정 */}
            <div className="w-full flex-shrink-0 max-w-full overflow-hidden">
              <MyGymTab friendId={me.userId} />
            </div>

            {/* StatsTab을 부모 크기에 맞게 조정 */}
            <div className="w-full flex-shrink-0">
              <StatsTab />
            </div>

            {/* PostsTab을 부모 크기에 맞게 조정 */}
            <div className="w-full flex-shrink-0">
              <PostsTab userId={me.userId} />
            </div>
          </div>
        </div>
      </div>

      {/* ✅ 하단바 공간 확보 */}
      <div className="pb-16">
        <BottomBar />
      </div>
    </>
  );
}
