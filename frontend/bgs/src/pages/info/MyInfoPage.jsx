import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../stores/useUserStore";
import { getUser, deleteUser } from "../../api/User"; // ✅ 유저 정보 및 삭제 API
import { getFollowerList, getFollowingList } from "../../api/Follow"; // ✅ 팔로워 & 팔로잉 목록 API
import { getUserPostCount } from "../../api/Feed"; // ✅ 게시물 개수 가져오기 API
import settings from "../../assets/icons/settings.svg";
import myinfo from "../../assets/icons/myinfo.png";
import { handleLogout } from "../../api/Auth"; // ✅ 로그아웃 API
import PostsTab from "../../components/myinfo/PostsTab"; // ✅ 게시물 탭
import StatsTab from "../../components/myinfo/StatsTab"; // ✅ 통계 탭
import MyGymTab from "../../components/myinfo/MyGymTab"; // ✅ 마이짐 탭
import BottomBar from "../../components/bar/BottomBar"; // ✅ 하단 네비게이션 바
import TopBar from "../../components/bar/TopBar"; // ✅ 상단 네비게이션 바

export default function MyInfoPage() {
  const navigate = useNavigate();
  const { me, setMe } = useUserStore(); // ✅ 현재 로그인한 유저 정보 (Zustand 상태 관리)
  const [activeTab, setActiveTab] = useState("myGym"); // ✅ 기본 탭을 "마이짐"으로 설정
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // ✅ 설정 메뉴 상태 (열림/닫힘)
  const dropdownRef = useRef(null); // ✅ 설정 메뉴 닫기 위한 ref
  const [followerCount, setFollowerCount] = useState(0); // ✅ 팔로워 수
  const [followingCount, setFollowingCount] = useState(0); // ✅ 팔로잉 수
  const [postCount, setPostCount] = useState(0); // ✅ 게시물 개수

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await getUser(); // ✅ 로그인된 유저 정보 요청
        setMe(res); // ✅ Zustand 상태 업데이트

        // ✅ 팔로워 & 팔로잉 수, 게시물 개수 한 번에 요청
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
              <p className="text-gray-600 mt-2">{me.introduction}</p>
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
          {/* ✅ 설정 버튼 */}
          <button
            ref={dropdownRef}
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          >
            <img src={settings} alt="설정" />
          </button>

          {/* ✅ 설정 드롭다운 메뉴 */}
          {isSettingsOpen && (
            <div className="absolute right-3 top-32 w-30 rounded-md bg-gray-100 border border-gray-200 ring-1 ring-black ring-opacity-5 z-10">
              <div role="menu">
                <div
                  onClick={() => navigate("/myinfoview")}
                  className="hover:bg-gray-100 p-2"
                >
                  <p className="inline-block align-middle">프로필</p>
                </div>
                <div className="border-b border-gray-200"></div>
                <div
                  onClick={() => handleLogout(navigate)}
                  className="hover:bg-gray-100 p-2 border-b border-gray-200"
                >
                  <p className="inline-block align-middle">로그아웃</p>
                </div>
                <div
                  onClick={handleDeleteUser}
                  className="text-danger hover:bg-gray-100 p-2"
                >
                  <p className="inline-block align-middle">회원탈퇴</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ✅ 탭 네비게이션 (탭 순서 변경됨) */}
        <div className="flex justify-around">
          {[
            { key: "myGym", label: "마이짐" },
            { key: "stats", label: "통계" },
            { key: "posts", label: `게시물 (${postCount})` },
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
          {activeTab === "myGym" && <MyGymTab friendId={me.userId} />}
          {activeTab === "stats" && <StatsTab />}
          {activeTab === "posts" && <PostsTab userId={me.userId} />}
        </div>
      </div>

      <BottomBar />
    </>
  );
}
