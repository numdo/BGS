import { useState, useEffect, useRef } from "react";
import BottomBar from "../../components/bar/BottomBar";
import TopBar from "../../components/bar/TopBar";
import FeedItem from "../../components/feed/FeedItem";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import useFeedTypeStore from "../../stores/useFeedTypeStore";

const DIARY_API_URL = "/diaries/feeds";
const EVALUATION_API_URL = "/evaluations/feeds";

const FeedPage = () => {
  const [feeds, setFeeds] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [page, setPage] = useState(1);
  const [evaluationPage, setEvaluationPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [hasMoreEvaluation, setHasMoreEvaluation] = useState(true);

  const { feedType, setFeedType } = useFeedTypeStore();
  const loaderRef = useRef(null);
  const evaluationLoaderRef = useRef(null);

  const navigate = useNavigate();

  // 스와이프 관련 상태
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [activeIndex, setActiveIndex] = useState(feedType === "diary" ? 0 : 1);
  const containerRef = useRef(null);

  // 스크롤 영역들
  const feedRef = useRef(null);
  const evaluationRef = useRef(null);

  // 무한 스크롤 - 일지
  const fetchFeeds = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const url = `${DIARY_API_URL}?page=${page}&pageSize=9`;
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

  // 무한 스크롤 - 평가
  const fetchEvaluations = async () => {
    if (evaluationLoading || !hasMoreEvaluation) return;
    setEvaluationLoading(true);

    try {
      const url = `${EVALUATION_API_URL}?page=${evaluationPage}&pageSize=9`;
      const response = await axiosInstance.get(url);
      const newEvaluations = response.data;

      if (newEvaluations.length === 0) {
        setHasMoreEvaluation(false);
      } else {
        setEvaluations((prev) => [...prev, ...newEvaluations]);
        setEvaluationPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      console.error("데이터를 불러오는 중 오류 발생:", error);
    } finally {
      setEvaluationLoading(false);
    }
  };

  // 일지 IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // 로더가 화면에 보여지고, 현재 로딩 중이 아니라면 fetchFeeds
        if (entries[0].isIntersecting && !loading) {
          fetchFeeds();
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loading, feedType]);

  // 평가 IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !evaluationLoading) {
          fetchEvaluations();
        }
      },
      { threshold: 1.0 }
    );

    if (evaluationLoaderRef.current) {
      observer.observe(evaluationLoaderRef.current);
    }

    return () => {
      if (evaluationLoaderRef.current) {
        observer.unobserve(evaluationLoaderRef.current);
      }
    };
  }, [evaluationLoaderRef, feedType]);

  // 이미지 클릭시 이동
  const handleImageClick = (id) => {
    if (feedType === "evaluation") {
      navigate(`/feeds/evaluation/${id}`);
    } else {
      navigate(`/feeds/diary/${id}`);
    }
  };

  // 탭 전환 버튼
  const handleFeedTypeChange = (type) => {
    setFeedType(type);
    setActiveIndex(type === "diary" ? 0 : 1);
    window.scrollTo({ top: 0 });
  };

  // 스와이프 이벤트: Touch 시작
  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
  };
  // 스와이프 이벤트: Touch Move
  const handleTouchMove = (e) => {
    const deltaX = e.touches[0].clientX - startX;
    setTranslateX(deltaX);
  };
  // 스와이프 이벤트: Touch End
  const handleTouchEnd = () => {
    if (translateX < -50 && activeIndex === 0) {
      // 일지 -> 평가로 스와이프
      handleFeedTypeChange("evaluation");
    } else if (translateX > 50 && activeIndex === 1) {
      // 평가 -> 일지로 스와이프
      handleFeedTypeChange("diary");
    }
    setTranslateX(0);
  };

  return (
    <>
      <TopBar />
      {/* 
        h-screen을 없애고, 
        min-h-screen + 하단 바 영역만큼 여백(pb-20) 부여 
      */}
      <div className="max-w-4xl mx-auto p-4 pb-20 min-h-screen">
        {/* 탭 버튼들 */}
        <div className="grid grid-cols-2 gap-2 justify-between mb-4">
          <button
            onClick={() => handleFeedTypeChange("diary")}
            className={`px-4 py-2 bg-white text-gray-700 transition ${
              feedType === "diary" ? "border-b-2 border-primary" : ""
            }`}
          >
            일지
          </button>
          <button
            onClick={() => handleFeedTypeChange("evaluation")}
            className={`px-4 py-2 bg-white text-gray-700 transition ${
              feedType === "evaluation" ? "border-b-2 border-primary" : ""
            }`}
          >
            평가
          </button>
        </div>

        {/* 스와이프 컨테이너 */}
        <div
          ref={containerRef}
          className="relative w-full" 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex w-full transition-transform duration-300"
            style={{
              transform: `translateX(calc(${
                activeIndex * -100
              }% + ${translateX}px))`,
            }}
          >
            {/* 일지 피드 */}
            <div className="w-full flex-shrink-0 p-4" ref={feedRef}>
              <div className="grid grid-cols-3 gap-2">
                {feeds.map(
                  (feed, index) =>
                    feed.imageUrl && (
                      <FeedItem
                        key={index}
                        feed={feed}
                        onClick={() =>
                          handleImageClick(feed.diaryId || feed.evaluationId)
                        }
                      />
                    )
                )}
              </div>
              {hasMore && (
                <div
                  ref={loaderRef}
                  className="h-10 mt-4 flex justify-center items-center"
                >
                  {loading && <p className="text-gray-500">Loading...</p>}
                </div>
              )}
            </div>

            {/* 평가 피드 */}
            <div className="w-full flex-shrink-0 p-4" ref={evaluationRef}>
              <div className="grid grid-cols-3 gap-2">
                {evaluations.map(
                  (feed, index) =>
                    feed.imageUrl && (
                      <FeedItem
                        key={index}
                        feed={feed}
                        onClick={() =>
                          handleImageClick(feed.diaryId || feed.evaluationId)
                        }
                      />
                    )
                )}
              </div>
              {hasMoreEvaluation && (
                <div
                  ref={evaluationLoaderRef}
                  className="h-10 mt-4 flex justify-center items-center"
                >
                  {evaluationLoading && (
                    <p className="text-gray-500">Loading...</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* + 버튼 */}
      <button
        onClick={() => {
          if (feedType === "diary") {
            navigate("/workout");
          } else if (feedType === "evaluation") {
            navigate("/evaluationcreate");
          }
        }}
        className="fixed bottom-20 right-4 bg-[#5968eb] text-white font-bold py-5 px-5 rounded-full transition-all duration-300"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="white" />
        </svg>
      </button>

      <BottomBar />
    </>
  );
};

export default FeedPage;
