import { useState, useEffect, useRef } from "react";
import BottomBar from "../../components/bar/BottomBar";
import TopBar from "../../components/bar/TopBar";
import FeedItem from "../../components/feed/FeedItem";
import axiosInstance from "../../utils/axiosInstance";
import addicon from "../../assets/icons/add.svg";
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

  //스와이프 관련 상태
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [activeIndex, setActiveIndex] = useState(feedType === "diary" ? 0 : 1);
  const containerRef = useRef(null);

  //스크롤 높이 관련 상태
  const feedRef = useRef(null);
  const evaluationRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState("auto");

  //스크롤 높이 관련 함수
  const updateContainerHeight = () => {
    if (feedType === "diary" && feedRef.current) {
      setContainerHeight(feedRef.current.clientHeight);
    } else if (feedType === "evaluation" && evaluationRef.current) {
      setContainerHeight(evaluationRef.current.clientHeight);
    }
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      updateContainerHeight();
    });

    const observer = new MutationObserver(() => {
      updateContainerHeight();
    });

    if (feedRef.current) {
      observer.observe(feedRef.current, { childList: true, subtree: true });
    }
    if (evaluationRef.current) {
      observer.observe(evaluationRef.current, {
        childList: true,
        subtree: true,
      });
    }

    return () => observer.disconnect();
  }, [feedType, feeds, evaluations]);

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
    if (translateX < -50 && activeIndex === 0) {
      setActiveIndex(1);
      setFeedType("evaluation");
      window.scrollTo({
        top: 0,
        behavior: "smooth", // 부드러운 스크롤
      });
    } else if (translateX > 50 && activeIndex === 1) {
      setActiveIndex(0);
      setFeedType("diary");
      window.scrollTo({
        top: 0,
        behavior: "smooth", // 부드러운 스크롤
      });
    }
    setTranslateX(0);
  };

  const fetchFeeds = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      let url = `${DIARY_API_URL}?page=${page}&pageSize=9`;

      const response = await axiosInstance.get(url);
      const newFeeds = response.data;
      if (newFeeds.length === 0) {
        setHasMore(false);
      } else {
        console.log("더불러오기");
        setFeeds((prev) => [...prev, ...newFeeds]);
        setPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      console.error("데이터를 불러오는 중 오류 발생:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchEvaluations = async () => {
    if (evaluationLoading || !hasMoreEvaluation) return;
    setEvaluationLoading(true);

    try {
      let url = `${EVALUATION_API_URL}?page=${evaluationPage}&pageSize=9`;

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
  }, [loading, feedType]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !evaluationLoading) {
          fetchEvaluations();
        }
      },
      { threshold: 1.0 }
    );

    if (evaluationLoaderRef.current)
      observer.observe(evaluationLoaderRef.current);
    return () => {
      if (evaluationLoaderRef.current)
        observer.unobserve(evaluationLoaderRef.current);
    };
  }, [evaluationLoaderRef, feedType]);

  const handleImageClick = (id) => {
    if (feedType === "evaluation") navigate(`/feeds/evaluation/${id}`);
    else navigate(`/feeds/diary/${id}`);
  };

  const handleFeedTypeChange = (type) => {
    setFeedType(type);
    if (type === "diary") {
      setActiveIndex(0);
    } else {
      setActiveIndex(1);
    }
  };

  return (
    <>
      <TopBar />
      <div className="max-w-4xl mx-auto p-4 h-screen">
        {" "}
        {/* 스와이프 이벤트 추가 */}
        {/* 피드 타입 탭 */}
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
        {/* 피드 리스트 */}
        <div
          ref={containerRef}
          style={{
            height: `${
              activeIndex === 0
                ? feeds.filter((feed) => feed.imageUrl).length * 32 + 200
                : evaluations.filter((feed) => feed.imageUrl).length * 32 + 200
            }px`,
          }}
          className="relative w-full flex-grow overflow-hidden"
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
