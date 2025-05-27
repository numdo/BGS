// src/components/feed/DiaryFeedContainer.js
import { useState, useEffect } from "react";
import DiaryFeedList from "./DiaryFeedList";
import { fetchDiaryFeeds } from "../../api/Feed";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";

const DiaryFeedContainer = ({ onImageClick }) => {
  const [feeds, setFeeds] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadFeeds = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const newFeeds = await fetchDiaryFeeds(page);
      if (newFeeds.length === 0) {
        setHasMore(false);
      } else {
        setFeeds((prev) => [...prev, ...newFeeds]);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error loading diary feeds:", error);
    } finally {
      setLoading(false);
    }
  };

  // 초기에 한 번 로딩
  useEffect(() => {
    loadFeeds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loaderRef = useInfiniteScroll(loadFeeds, [loading]);

  return (
    <DiaryFeedList
      feeds={feeds}
      loaderRef={loaderRef}
      loading={loading}
      hasMore={hasMore}
      onImageClick={onImageClick}
    />
  );
};

export default DiaryFeedContainer;
