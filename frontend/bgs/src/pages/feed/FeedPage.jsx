import React, { useState, useEffect, useRef } from "react";
import BottomBar from "../components/BottomBar";
import TopBar from "../components/TopBar";
import FeedItem from "../../components/feed/FeedItem";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "https://i12c209.p.ssafy.io/api/diaries/feeds";
const accessToken = localStorage.getItem("accessToken");

const FeedPage = () => {
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null);
  const navigate = useNavigate();

  // 📌 API에서 데이터 가져오는 함수
  const fetchImages = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await axios.get(`${API_URL}?page=${page}&pageSize=9`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log(response);

      const newImages = response.data.map((item) => ({
        id: item.diaryId,
        imageUrl: item.imageUrl,
      }));

      console.log(newImages);

      setImages((prev) => [...prev, ...newImages]);

      console.log(images);

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
          fetchImages();
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
  }, [loading]);

  // 📌 상세 페이지 이동 함수
  const handleImageClick = (id) => {
    navigate(`/feed/${id}`);
  };

  return (
    <>
      <TopBar />
      <div className="max-w-4xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">탐색</h2>
        <div className="grid grid-cols-3 gap-1 md:gap-2">
          {images.map((image) => (
            <FeedItem
              key={image.id}
              feed={image}
              onClick={() => handleImageClick(image.id)}
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
