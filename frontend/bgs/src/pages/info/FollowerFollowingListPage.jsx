import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFollowerList, getFollowingList } from "../../api/Follow";
import TopBar from "../../components/bar/TopBar";
import BottomBar from "../../components/bar/BottomBar";
import UserList from "../../components/follow/UserList";
import BeatLoader from "../../components/common/LoadingSpinner"; // ✅ 로딩 스피너
import DefaultProfileImage from "../../assets/icons/myinfo.png"; // ✅ 기본 프로필 이미지

export default function FollowerFollowingListPage() {
  const { type } = useParams();
  const navigate = useNavigate();
  const fetchedData = useRef({ followers: null, following: null });

  const [activeIndex, setActiveIndex] = useState(null); // ✅ 초기값을 null로 설정
  const [followers, setFollowers] = useState(null);
  const [following, setFollowing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [translateX, setTranslateX] = useState(0);

  const containerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // ✅ 데이터 로딩 및 activeIndex 설정
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (!fetchedData.current.followers || !fetchedData.current.following) {
          const [followersData, followingData] = await Promise.all([
            getFollowerList(),
            getFollowingList(),
          ]);
          fetchedData.current.followers = followersData;
          fetchedData.current.following = followingData;
        }
        setFollowers(fetchedData.current.followers);
        setFollowing(fetchedData.current.following);

        // ✅ 데이터 로딩 후, activeIndex를 한 번만 설정
        setActiveIndex(type === "following" ? 1 : 0);
      } catch (error) {
        console.error("❌ 팔로워/팔로잉 리스트 불러오기 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [type]);

  // ✅ activeIndex 변경 시 컨테이너 위치 업데이트
  useEffect(() => {
    if (activeIndex !== null && containerRef.current) {
      containerRef.current.style.transform = `translateX(calc(${
        activeIndex * -100
      }% + ${translateX}px))`;
    }
  }, [activeIndex, translateX]);

  const handleTabChange = (index) => {
    setActiveIndex(index);
    navigate(`/follow/${index === 0 ? "followers" : "following"}`, {
      replace: true,
    });
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    setTranslateX(e.touches[0].clientX - touchStartX.current);
  };

  const handleTouchEnd = () => {
    if (translateX < -50 && activeIndex === 0) {
      handleTabChange(1);
    } else if (translateX > 50 && activeIndex === 1) {
      handleTabChange(0);
    }
    setTranslateX(0);
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
        {/* ✅ 상단 네비게이션 바 */}
        <div className="relative flex justify-between border-b">
          <button
            className={`py-3 flex-1 text-center font-semibold transition ${
              activeIndex === 0 ? "text-gray-900" : "text-gray-500"
            }`}
            onClick={() => handleTabChange(0)}
          >
            팔로워 <span className="font-bold"> {followers?.length ?? 0} </span>
          </button>
          <button
            className={`py-3 flex-1 text-center font-semibold transition ${
              activeIndex === 1 ? "text-gray-900" : "text-gray-500"
            }`}
            onClick={() => handleTabChange(1)}
          >
            팔로잉 <span className="font-bold"> {following?.length ?? 0} </span>
          </button>
          {/* 🎯 하이라이트 바 (슬라이드 애니메이션 적용) */}
          <div
            className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-transform duration-300"
            style={{
              width: "50%",
              transform: `translateX(${
                activeIndex !== null ? activeIndex * 100 : 0
              }%)`,
            }}
          ></div>
        </div>

        {/* ✅ 로딩 중일 때 BeatLoader 적용 */}
        {isLoading || activeIndex === null ? (
          <div className="flex justify-center items-center h-64">
            <BeatLoader color="#3498db" />
          </div>
        ) : (
          /* ✅ 슬라이드 컨테이너 */
          <div className="relative flex-grow overflow-hidden mt-4">
            <div
              className="flex transition-transform duration-300 ease-in-out w-full"
              ref={containerRef}
            >
              <div className="w-full flex-shrink-0 flex justify-center">
                {followers ? (
                  <UserList
                    users={followers}
                    emptyMessage="팔로워가 없습니다."
                  />
                ) : (
                  <BeatLoader color="#3498db" />
                )}
              </div>
              <div className="w-full flex-shrink-0 flex justify-center">
                {following ? (
                  <UserList
                    users={following}
                    emptyMessage="팔로잉이 없습니다."
                  />
                ) : (
                  <BeatLoader color="#3498db" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomBar />
    </>
  );
}
