// src/components/feed/EvaluationFeedContainer.js
import { useState } from "react";
import EvaluationFeedList from "./EvaluationFeedList";
import { fetchEvaluationFeeds } from "../../api/Feed";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";

const EvaluationFeedContainer = ({ onImageClick }) => {
  const [evaluations, setEvaluations] = useState([]);
  const [page, setPage] = useState(1); // 백엔드 기본값이 1-based
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadEvaluations = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const newEvaluations = await fetchEvaluationFeeds(page, 9);
      console.log("Fetched new evaluations:", newEvaluations);
      if (newEvaluations.length === 0) {
        setHasMore(false);
      } else {
        setEvaluations((prev) => [...prev, ...newEvaluations]);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error loading evaluation feeds:", error);
    } finally {
      setLoading(false);
    }
  };

  // 초기 로딩용 useEffect 제거하여 중복 호출 방지
  const loaderRef = useInfiniteScroll(loadEvaluations, [loading]);

  return (
    <EvaluationFeedList
      evaluations={evaluations}
      loaderRef={loaderRef}
      loading={loading}
      hasMore={hasMore}
      onImageClick={onImageClick}
    />
  );
};

export default EvaluationFeedContainer;
