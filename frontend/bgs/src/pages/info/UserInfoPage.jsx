import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getUser } from "../../api/User";
import { follow, unfollow, getFollowingList } from "../../api/Follow";
import { getUserPostCount } from "../../api/Feed"; // ✅ 게시물 개수 가져오는 API
import PostsTab from "../../components/myinfo/PostsTab";
import MyGymTab from "../../components/myinfo/MyGymTab";
import DefaultProfileImage from "../../assets/icons/myinfo.png";
import BottomBar from "../../components/bar/BottomBar";
import TopBar from "../../components/bar/TopBar";

export default function UserInfoPage() {
  // ✅ URL에서 userId 가져오기
  const { userId } = useParams();

  // ✅ 유저 정보, 팔로우 상태, 탭 관리 상태
  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("myGym"); // ✅ "마이짐"을 기본 탭으로 설정
  const [postCount, setPostCount] = useState(0); // ✅ 게시물 개수 저장 상태

  // ✅ 유저 정보 가져오기 (프로필 & 게시물 개수)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await getUser(userId); // ✅ 해당 userId의 프로필 데이터 가져오기
        console.log("🔹 친구 프로필 데이터:", res);
        setUser(res);

        // ✅ 동시에 여러 API 요청 (팔로우 상태 확인 & 게시물 개수 가져오기)
        const [followingList, postData] = await Promise.all([
          getFollowingList(), // ✅ 사용자가 팔로우한 유저 리스트
          getUserPostCount(userId), // ✅ 해당 유저의 게시물 개수
        ]);

        // ✅ 현재 사용자가 해당 유저를 팔로우하고 있는지 확인
        const isUserFollowing = followingList.some(
          (f) => f.userId === res.userId
        );
        setIsFollowing(isUserFollowing);

        // ✅ 게시물 개수를 저장 (API 응답이 undefined일 경우 대비해서 기본값 0)
        setPostCount(postData ?? 0);
      } catch (error) {
        console.error("❌ 친구 프로필 가져오기 실패:", error);
      }
    };

    fetchUserData();
  }, [userId]); // ✅ userId가 변경될 때마다 실행

  // ✅ 팔로우 / 언팔로우 처리 함수
  const handleFollowToggle = async () => {
    if (!user?.userId) {
      console.error("❌ 유저 ID가 존재하지 않습니다.");
      return;
    }

    // ✅ UI 즉시 반영을 위해 현재 상태를 반전시킴
    const previousState = isFollowing;
    setIsFollowing(!isFollowing);

    try {
      if (isFollowing) {
        await unfollow(user.userId); // ✅ 언팔로우 요청
        console.log(`언팔로우 성공: ${user.userId}`);
      } else {
        await follow(user.userId); // ✅ 팔로우 요청
        console.log(`팔로우 성공: ${user.userId}`);
      }
    } catch (error) {
      console.error("❌ 팔로우 변경 중 오류 발생:", error);
      setIsFollowing(previousState); // ✅ 실패 시 원래 상태로 복구
    }
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
              src={user.profileImageUrl || DefaultProfileImage} // ✅ 기본 이미지 설정
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
          {/* ✅ 팔로우 / 언팔로우 버튼 */}
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

        {/* ✅ 탭 네비게이션 (마이짐이 왼쪽, 게시물이 오른쪽) */}
        <div className="border-b mb-4 flex justify-around">
          {[
            { key: "myGym", label: "마이짐" },
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
              className={`py-2 px-4 ${
                activeTab === tab.key
                  ? "border-b-2 border-gray-800 text-gray-800"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ✅ 탭 내용 렌더링 (마이짐이 기본으로 보이도록) */}
        <div className="p-4">
          {activeTab === "myGym" && <MyGymTab friendId={user.userId} />}
          {activeTab === "posts" && (
            <PostsTab userId={user.userId} nickname={user.nickname} />
          )}
        </div>
      </div>

      <BottomBar />
    </>
  );
}
