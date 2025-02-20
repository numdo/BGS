import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { getUser } from "../../api/User";
import { follow, unfollow, getFollowingList } from "../../api/Follow";
import { getUserPostCount } from "../../api/Feed";
import PostsTab from "../../components/myinfo/PostsTab";
import MyGymTab from "../../components/myinfo/MyGymTab";
import DefaultProfileImage from "../../assets/icons/myinfo.png";
import BottomBar from "../../components/bar/BottomBar";
import TopBar from "../../components/bar/TopBar";
import AlertModal from "../../components/common/AlertModal";
import BeatLoader from "../../components/common/LoadingSpinner";

export default function UserInfoPage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  // ✅ `localStorage`에서 탭 상태 가져오기
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem(`activeTab-${userId}`) || "myGym";
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [alertData, setAlertData] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); // ✅ 프로필 이미지 확대 모달 상태

  const containerRef = useRef(null);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);

  // ✅ 유저 정보 가져오기 (프로필 & 게시물 개수)
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
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
        setAlertData({ message: "유저 정보를 불러오지 못했습니다." });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // ✅ 팔로우 / 언팔로우 즉시 변경
  const handleFollowToggle = async () => {
    if (!user?.userId) return;

    const previousState = isFollowing;
    setIsFollowing(!isFollowing);

    try {
      isFollowing ? await unfollow(user.userId) : await follow(user.userId);
    } catch (error) {
      console.error("❌ 팔로우 변경 중 오류 발생:", error);
      setIsFollowing(previousState);
      setAlertData({ message: "팔로우 변경 중 오류가 발생했습니다." });
    }
  };

  // ✅ 탭 변경 시 `localStorage`에 저장
  const moveTab = (tabKey) => {
    localStorage.setItem(`activeTab-${userId}`, tabKey);
    setActiveTab(tabKey);
  };

  if (!user || loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
        <BeatLoader size={15} color="#5968eb" />
      </div>
    );
  }

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
              className="rounded-full h-20 w-20 cursor-pointer"
              onClick={() => setIsImageModalOpen(true)} // ✅ 이미지 클릭 시 모달 열기
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
            className={`py-3 px-4 rounded-md whitespace-nowrap ${
              isFollowing
                ? "bg-gray-400 text-base text-white"
                : "bg-primary text-base text-white"
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
              { key: "posts", label: `게시물 ${postCount}` },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`flex-1 text-center py-2 transition ${
                  activeTab === tab.key
                    ? "text-gray-900 font-semibold"
                    : "text-gray-500"
                }`}
                onClick={() => moveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
            {/* 🔥 하이라이트 바 */}
            <div
              className="absolute bottom-0 left-0 h-[2px] bg-primary transition-transform duration-300 ease-in-out"
              style={{
                width: "50%",
                transform: `translateX(${
                  activeTab === "posts" ? "100%" : "0%"
                })`,
              }}
            ></div>
          </div>
        </div>

        {/* ✅ 탭 내용 */}
        <div className="mt-4">
          {activeTab === "myGym" && <MyGymTab friendId={user.userId} />}
          {activeTab === "posts" && <PostsTab userId={user.userId} />}
        </div>
      </div>
      {/* ✅ 하단바 공간 확보 */}
      <div className="pb-16">
        <BottomBar />
      </div>

      {/* ✅ 프로필 이미지 확대 모달 */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1000]"
          onClick={() => setIsImageModalOpen(false)} // ✅ 모달 닫기
        >
          <div className="relative p-4">
            <img
              src={user.profileImageUrl || DefaultProfileImage}
              alt="Profile Enlarged"
              className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}

      {/* ✅ 모달 적용 */}
      {alertData && (
        <AlertModal {...alertData} onClose={() => setAlertData(null)} />
      )}
    </>
  );
}
