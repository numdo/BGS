import React, { useState, useEffect, useRef } from "react";
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
  const [isEvaluation, setIsEvaluation] = useState(false); // 일지와 평가 스위치 상태
  const loaderRef = useRef(null);
  const navigate = useNavigate();

  // 📌 API에서 데이터 가져오는 함수
  const fetchFeeds = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const url = isEvaluation
        ? `${EVALUATION_API_URL}?page=${page}&pageSize=9`
        : `${DIARY_API_URL}?page=${page}&pageSize=9`;

      const response = await axiosInstance.get(url);

      const newFeeds = response.data.map((item) => ({
        ...item,
      }));

      setFeeds((prev) => [...prev, ...newFeeds]);
      setPage((prevPage) => prevPage + 1);
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

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [loading, isEvaluation]);

  // 📌 상세 페이지 이동 함수
  const handleImageClick = (id) => {
    if (isEvaluation) navigate(`/feeds/evaluation/${id}`);
    else navigate(`/feeds/diary/${id}`);
  };

  // 📌 스위치 버튼 클릭 함수
  const handleSwitch = () => {
    setFeeds([]); // 스위치 시 피드 초기화
    setPage(1); // 페이지 초기화
    setIsEvaluation(!isEvaluation); // 평가/일지 상태 변경
  };

  return (
    <>
      <TopBar />
      <div className="max-w-4xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">탐색</h2>
        <div className="flex mb-4">
          <button
            onClick={handleSwitch}
            className={`px-4 py-2 mr-2 rounded-md ${
              !isEvaluation ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-700"
            }`}
          >
            일지
          </button>
          <button
            onClick={handleSwitch}
            className={`px-4 py-2 rounded-md ${
              isEvaluation ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-700"
            }`}
          >
            평가
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1 md:gap-2">
          {feeds.map((feed) => (
            <FeedItem
              key={feed.diaryId || feed.evaluationId}
              feed={feed}
              onClick={() => handleImageClick(feed.diaryId || feed.evaluationId)}
            />
          ))}
        </div>
        {/* 로딩 트리거 (Intersection Observer 대상) */}
        <div ref={loaderRef} className="h-10 mt-4 flex justify-center items-center">
          {loading && <p className="text-gray-500">Loading...</p>}
        </div>
      </div>
      <BottomBar />
    </>
  );
};

export default FeedPage;
