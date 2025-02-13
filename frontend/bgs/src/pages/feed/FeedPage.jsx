import { useState, useEffect, useRef } from "react";
import BottomBar from "../../components/bar/BottomBar";
import TopBar from "../../components/bar/TopBar";
import FeedItem from "../../components/feed/FeedItem";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const DIARY_API_URL = "/diaries/feeds";
const EVALUATION_API_URL = "/evaluations/feeds";

const FeedPage = () => {
  const [feeds, setFeeds] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // 추가 요청 가능 여부
  const [feedType, setFeedType] = useState("diary"); // 'diary' | 'evaluation'
  const [evaluationStatus, setEvaluationStatus] = useState("ongoing"); // '' | 'ongoing' | 'closed'
  const loaderRef = useRef(null);
  const navigate = useNavigate();

  // 📌 API에서 데이터 가져오는 함수
  const fetchFeeds = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      let url = "";
      if (feedType === "diary") {
        url = `${DIARY_API_URL}?page=${page}&pageSize=9`;
      } else {
        url = `${EVALUATION_API_URL}?page=${page}&pageSize=9`;
        if (evaluationStatus === "ongoing") url += "&closed=false";
        if (evaluationStatus === "closed") url += "&closed=true";
      }

      const response = await axiosInstance.get(url);
      const newFeeds = response.data;

      if (newFeeds.length === 0) {
        setHasMore(false);
      } else {
        setFeeds((prev) => [...prev, ...newFeeds]);
        setPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      console.error("데이터를 불러오는 중 오류 발생:", error);
    } finally {
      setLoading(false);
    }
  };

  // 📌 Intersection Observer를 사용한 무한 스크롤
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          fetchFeeds();
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [loading, feedType, evaluationStatus]);

  // 📌 상세 페이지 이동 함수
  const handleImageClick = (id) => {
    if (feedType === "evaluation") navigate(`/feeds/evaluation/${id}`);
    else navigate(`/feeds/diary/${id}`);
  };

  // 📌 선택 변경 시 피드 초기화
  const handleFeedTypeChange = (event) => {
    setFeedType(event.target.value);
    setFeeds([]);
    setPage(1);
    setHasMore(true);
  };

  const handleEvaluationStatusChange = (event) => {
    setEvaluationStatus(event.target.value);
    setFeeds([]);
    setPage(1);
    setHasMore(true);
  };

  return (
    <>
      <TopBar />
      <div className="max-w-4xl mx-auto p-4">
        {/* 📌 피드 타입 선택 */}
        <div className="flex mb-4 space-x-2">
          <select
            value={feedType}
            onChange={handleFeedTypeChange}
            className="px-4 py-2 border rounded-md"
          >
            <option value="diary">일지</option>
            <option value="evaluation">평가</option>
          </select>

          {/* 📌 평가 선택 시 진행 중 / 종료된 평가 필터 추가 */}
          {feedType === "evaluation" && (
            <select
              defaultValue="ongoing"
              value={evaluationStatus}
              onChange={handleEvaluationStatusChange}
              className="px-4 py-2 border rounded-md"
            >
              <option value="ongoing">진행 중 평가</option>
              <option value="closed">종료된 평가</option>
            </select>
          )}
        </div>

        {/* 📌 피드 리스트 */}
        <div className="grid grid-cols-3 gap-1 md:gap-2">
          {feeds.map((feed) =>
            feed.imageUrl ? (
              <FeedItem
                key={feed.diaryId || feed.evaluationId}
                feed={feed}
                onClick={() =>
                  handleImageClick(feed.diaryId || feed.evaluationId)
                }
              />
            ) : null
          )}
        </div>

        {/* 📌 로딩 트리거 (Intersection Observer 대상) */}
        {hasMore && (
          <div
            ref={loaderRef}
            className="h-10 mt-4 flex justify-center items-center"
          >
            {loading && <p className="text-gray-500">Loading...</p>}
          </div>
        )}
      </div>
      <BottomBar />
    </>
  );
};

export default FeedPage;
