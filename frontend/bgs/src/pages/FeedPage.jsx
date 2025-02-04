import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BottomBar from "../components/BottomBar";
import TopBar from "../components/TopBar";
import FeedItem from "../components/feed/FeedItem";

const API_URL = "http://localhost:8080/api/diaries/feeds";

const FeedPage = () => {
  const [feeds, setFeeds] = useState([]); // 받아온 피드 데이터
  const [page, setPage] = useState(1); // 페이지네이션
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const loaderRef = useRef(null);
  const navigate = useNavigate();

  // 📌 API 요청 함수
  const fetchFeeds = async () => {
    if (isLoading) return; // 중복 요청 방지
    setIsLoading(true);
    
    try {
      const response = await axios.get(`${API_URL}?page=${page}&pageSize=9`);
      
      // 이미지 URL을 절대 경로로 변환
      const newFeeds = response.data.map(feed => ({
        ...feed,
        imageUrl: `${feed.imageUrl}`,
      }));

      setFeeds((prev) => [...prev, ...newFeeds]); // 기존 데이터에 추가
      setPage((prev) => prev + 1); // 페이지 증가
    } catch (error) {
      console.error("데이터 불러오기 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 📌 Intersection Observer (무한 스크롤)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchFeeds(); // 스크롤 시 데이터 추가
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
  }, []);

  return (
    <>
      <TopBar />
      <div className="max-w-4xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">탐색</h2>
        <div className="grid grid-cols-3 gap-1 md:gap-2">
          {feeds.map((feed) => (
            <FeedItem
              key={feed.diaryId}
              feed={feed}
              onClick={() => navigate(`/feed/${feed.diaryId}`)} // 클릭 시 상세 페이지 이동
            />
          ))}
        </div>
        {/* 로딩 트리거 */}
        <div ref={loaderRef} className="h-10 mt-4 flex justify-center items-center">
          {isLoading && <p className="text-gray-500">Loading...</p>}
        </div>
      </div>
      <BottomBar />
    </>
  );
};

export default FeedPage;
