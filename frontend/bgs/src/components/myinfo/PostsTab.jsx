import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getFeeds } from "../../api/Feed";
import FeedItem from "../../components/feed/FeedItem";
import FeedDefaultImage from "../../assets/images/feeddefaultimage.png"; // 기본 이미지
import BeatLoader from "../../components/common/LoadingSpinner"; // ✅ 로딩 스피너 추가

const PostsTab = ({ userId }) => {
  const [feeds, setFeeds] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true); // ✅ 초기 로딩 여부
  const loaderRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;

    const fetchUserFeeds = async () => {
      if (loading || !hasMore) return;
      setLoading(true);

      try {
        const response = await getFeeds(userId, page);
        const userFeeds = response.map((item) => ({
          id: item.diaryId,
          imageUrl: item.imageUrl || FeedDefaultImage,
          likedCount: item.likedCount,
          commentCount: item.commentCount,
        }));

        setFeeds((prev) => {
          const mergedFeeds = [...prev, ...userFeeds];
          const uniqueFeeds = Array.from(
            new Map(mergedFeeds.map((feed) => [feed.id, feed])).values()
          );
          return uniqueFeeds;
        });

        setPage((prev) => prev + 1);
        if (userFeeds.length === 0) setHasMore(false);
      } catch (error) {
        console.error("❌ 유저 게시물 불러오기 실패:", error);
      } finally {
        setLoading(false);
        setInitialLoad(false); // ✅ 첫 로딩 완료
      }
    };

    fetchUserFeeds();
  }, [userId, page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [loading]);

  const handleImageClick = (id) => {
    navigate(`/feeds/diary/${id}`);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* ✅ 처음 로딩 중일 때 로딩 스피너 표시 */}
      {initialLoad && (
        <div className="flex justify-center items-center h-32">
          <BeatLoader size={15} color="#2563eb" />
        </div>
      )}

      {/* ✅ 게시물이 없을 때 메시지 표시 */}
      {!loading && feeds.length === 0 && !hasMore && !initialLoad && (
        <p className="text-gray-500 text-center mt-6">게시물을 작성해보세요</p>
      )}

      {/* ✅ 게시물 리스트 */}
      {feeds.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {feeds.map((feed) => (
            <FeedItem
              key={feed.id}
              feed={feed}
              onClick={() => handleImageClick(feed.id)}
            />
          ))}
        </div>
      )}

      {/* ✅ 무한 스크롤 로딩 */}
      {hasMore && !initialLoad && (
        <div
          ref={loaderRef}
          className="h-10 mt-4 flex justify-center items-center"
        >
          {loading && <BeatLoader size={15} color="#2563eb" />}
        </div>
      )}
    </div>
  );
};

export default PostsTab;
