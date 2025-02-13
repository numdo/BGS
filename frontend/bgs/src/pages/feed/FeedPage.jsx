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
  const [evaluationTabVisible, setEvaluationTabVisible] = useState(false);
  const [feedsResetTrigger, setFeedsResetTrigger] = useState(0); // 피드 재요청을 위한 trigger
  const loaderRef = useRef(null);
  const navigate = useNavigate();

  // API에서 데이터 가져오는 함수
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

  // Intersection Observer를 사용한 무한 스크롤
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
  }, [loading, feedType, evaluationStatus, feedsResetTrigger]);

  // 상세 페이지 이동 함수
  const handleImageClick = (id) => {
    if (feedType === "evaluation") navigate(`/feeds/evaluation/${id}`);
    else navigate(`/feeds/diary/${id}`);
  };

  // 피드 타입 탭 변경 함수
  const handleFeedTypeChange = (type) => {
    setFeedType(type);
    setFeeds([]);
    setPage(1);
    setHasMore(true);
    // 평가 탭이 선택된 경우 평가 상태 탭을 보이게 함
    if (type === "evaluation") {
      setEvaluationTabVisible(true);
    } else {
      setEvaluationTabVisible(false);
    }
  };

  // 평가 상태 탭 변경 함수
  const handleEvaluationStatusChange = (status) => {
    setEvaluationStatus(status);
    setFeeds([]);
    setPage(1);
    setHasMore(true);
  };

  return (
    <>
      <TopBar />
      <div className="max-w-4xl mx-auto p-4">
        {/* 피드 타입 탭 */}
        <div className="flex mb-4 space-x-2">
          <button
            onClick={() => handleFeedTypeChange("diary")}
            className={`px-4 py-2 border rounded-md transition ${
              feedType === "diary"
                ? "bg-primary text-white"
                : "bg-white text-gray-700"
            }`}
          >
            일지
          </button>
          <button
            onClick={() => handleFeedTypeChange("evaluation")}
            className={`px-4 py-2 border rounded-md transition ${
              feedType === "evaluation"
                ? "bg-primary text-white"
                : "bg-white text-gray-700"
            }`}
          >
            평가
          </button>
        </div>
        {/* 평가 상태 탭 (평가 탭이 선택되었을 때만 표시) */}
        {feedType === "evaluation" && (
          <div className="flex mb-4 space-x-2">
            <button
              onClick={() => handleEvaluationStatusChange("ongoing")}
              className={`px-4 py-2 border rounded-md transition ${
                evaluationStatus === "ongoing"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              진행 중 평가
            </button>
            <button
              onClick={() => handleEvaluationStatusChange("closed")}
              className={`px-4 py-2 border rounded-md transition ${
                evaluationStatus === "closed"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              종료된 평가
            </button>
          </div>
        )}

        {/* 피드 리스트 */}
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

        {/* 로딩 트리거 (Intersection Observer 대상) */}
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
