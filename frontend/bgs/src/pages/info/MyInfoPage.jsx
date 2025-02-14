import { useState, useEffect } from "react";
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
        <div className="flex justify-center gap-14 mt-4">
          {[
            { key: "myGym", label: "마이짐" },
            { key: "stats", label: "통계" },
            {
              key: "posts",
              label: (
                <>
                  게시물 <span className="font-bold">{postCount}</span>
                </>
              ),
            },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`py-2 ${
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
          {activeTab === "myGym" && <MyGymTab friendId={me.userId} />}
          {activeTab === "stats" && <StatsTab />}
          {activeTab === "posts" && <PostsTab userId={me.userId} />}
        </div>
      </div>

      <BottomBar />
    </>
  );
}
