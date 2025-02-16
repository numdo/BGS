import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import Slider from "react-slick";
import TopBar from "../../components/bar/TopBar";
import BottomBar from "../../components/bar/BottomBar";
import CommentList from "../../components/feed/CommentList";
import CommentInput from "../../components/feed/CommentInput";
import FeedDefalutImage from "../../assets/images/feeddefaultimage.png";
import ProfileDefaultImage from "../../assets/icons/myinfo.png";
import fire from "../../assets/icons/fire.svg";
import fire_colored from "../../assets/icons/fire_colored.svg";
import chat from "../../assets/icons/chat.svg";
import fitness_center from "../../assets/icons/fitness_center.svg";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import useUserStore from "../../stores/useUserStore";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
const API_URL = "/diaries";

const DiaryDetailPage = () => {
  const { me } = useUserStore();
  const { diaryId } = useParams();
  const navigate = useNavigate();
  const [feed, setFeed] = useState(null);
  const [userId, setUserId] = useState(me.userId);
  const [isLiked, setIsLiked] = useState(false);
  const [likedCount, setLikedCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(true);
  const [isWorkoutsOpen, setIsWorkoutsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [comments, setComments] = useState([]);
  useEffect(() => {
    console.log(feed);
  }, [feed]);
  useEffect(() => {
    console.log(refreshKey);
  }, refreshKey);
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_URL}/${diaryId}/comments`,
          {
            page: 1,
            pageSize: 100,
          }
        );
        console.log(response.data);
        setComments(response.data);
      } catch (error) {
        console.error("댓글 불러오기 오류:", error);
      }
    };

    fetchComments();
  }, [diaryId, refreshKey]);
  useEffect(() => {
    axiosInstance
      .get(`${API_URL}/${diaryId}`)
      .then((response) => {
        setFeed(response.data);
        setLikedCount(response.data.likedCount);
        setIsLiked(response.data.isLiked);
      })
      .catch((error) => console.error("게시글 불러오기 오류:", error));
  }, [diaryId]);

  if (!feed) return <p>로딩 중...</p>;

  // ✅ 프로필 클릭 시 해당 유저 프로필 페이지로 이동하는 함수
  const handleProfileClick = () => {
    if (feed.userId === me.userId) {
      navigate(`/myinfo`); // ✅ 내 정보 페이지로 이동
    } else {
      navigate(`/profile/${feed.userId}`); // ✅ 해당 유저의 프로필 페이지로 이동
    }
  };

  // 좋아요 토글 함수
  const onLikeToggle = async () => {
    try {
      if (isLiked) {
        await axiosInstance.delete(`${API_URL}/${diaryId}/liked`);
        setLikedCount((prev) => prev - 1);
      } else {
        await axiosInstance.post(`${API_URL}/${diaryId}/liked`);
        setLikedCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("좋아요 처리 오류:", error);
    }
  };

  // 게시글 삭제 함수
  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await axiosInstance.delete(`${API_URL}/${diaryId}`);
        alert("삭제되었습니다.");
        navigate("/feeds");
      } catch (error) {
        console.error("삭제 오류:", error);
      }
    }
  };

  // 메뉴 토글 함수
  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  // 캐러셀 설정
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <>
      <TopBar />
      <div className="relative max-w-2xl mx-auto">
        <div className="p-4 pb-20 pt-2">
          {/* 프로필 & 작성자 */}
          <div className="flex items-center mb-4">
            <img
              src={feed.profileImageUrl || ProfileDefaultImage}
              alt="프로필"
              className="w-10 h-10 rounded-full cursor-pointer m-1"
              onClick={handleProfileClick}
            />
            <div className="ml-1 p-2 pb-1">
              <p
                className="font-bold cursor-pointer"
                onClick={handleProfileClick}
              >
                {feed.writer}
              </p>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(feed.workoutDate), {
                  addSuffix: true,
                  locale: ko,
                })}
              </p>
            </div>

            {/* 메뉴바 */}
            <div className="ml-auto relative">
              {feed.userId == userId && (
                <button onClick={toggleMenu} className="text-xl">
                  ⋮
                </button>
              )}

              {/* 메뉴 */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 bg-white border shadow-lg rounded-md w-40 z-10">
                  <ul>
                    <li
                      onClick={() => {
                        navigate(`/workoutupdate/${diaryId}`); // 수정 페이지로 이동
                      }}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                    >
                      수정
                    </li>
                    <li
                      onClick={handleDelete}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                    >
                      삭제
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* 이미지 캐러셀 */}
          <Slider {...settings}>
            {feed.images.length > 0 ? (
              feed.images.map((img) => (
                <img
                  key={img.imageId}
                  src={img.url}
                  alt="게시글 이미지"
                  className="w-full rounded-md"
                />
              ))
            ) : (
              <img
                src={FeedDefalutImage}
                alt="게시글 기본 이미지"
                className="w-full rounded-md"
              />
            )}
          </Slider>

          {/* 게시글 정보 */}
          <div className="mt-4">
            <p className="text-lg font-bold">{feed.content}</p>
            <div className="flex justify-end mr-3">
              <img src={fire_colored} alt="" />
              <div className="text-gray-500 m-1"> {likedCount}</div>
              <img src={chat} alt="" />
              <div className="text-gray-500 m-1">{comments.length}</div>
            </div>
            <div className="flex items-center justify-around m-2">
              <div>
                <p className="flex text-gray-700 cursor-pointer">
                  {isLiked ? (
                    <img onClick={onLikeToggle} src={fire_colored} alt="" />
                  ) : (
                    <img onClick={onLikeToggle} src={fire} alt="" />
                  )}
                </p>
              </div>
              <div className="flex">
                <img
                  onClick={() => {
                    setIsCommentsOpen(!isCommentsOpen);
                  }}
                  src={chat}
                  alt=""
                />
              </div>
              <div>
                <img
                  onClick={() => {
                    setIsWorkoutsOpen(!isWorkoutsOpen);
                  }}
                  src={fitness_center}
                  alt=""
                />
              </div>
            </div>
          </div>

          {/* 댓글 입력창 & 댓글 목록 */}
          {isCommentsOpen && (
            <div className="mt-6">
              <CommentInput
                diaryId={diaryId}
                onCommentAdded={() => {
                  setRefreshKey((prev) => prev + 1);
                }}
              />
              <CommentList key={refreshKey} comments={comments} />
            </div>
          )}
          {isWorkoutsOpen && (
            <div className="mt-6">
              {/* 운동 세트 정보 */}
              <div className="space-y-4">
                {(feed.diaryWorkouts || []).map((workout) => {
                  // 만약 diaryWorkouts에 workoutName이 있다면 바로 사용
                  const workoutName = workout.workoutName;
                  return (
                    <div
                      key={workout.diaryWorkoutId}
                      className="p-4 bg-gray-100 rounded-lg shadow"
                    >
                      <h3 className="text-lg font-semibold text-gray-800">
                        {workoutName}
                      </h3>
                      <div className="mt-2 space-y-2">
                        {workout.sets?.map((set, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-sm"
                          >
                            <span className="font-medium">
                              세트 {index + 1}:
                            </span>
                            {set.workoutTime ? (
                              <span className="text-gray-900">
                                {set.workoutTime}초
                              </span>
                            ) : (
                              <span>
                                {set.weight ? `${set.weight}kg × ` : ""}{" "}
                                {set.repetition ? `${set.repetition}회` : ""}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <BottomBar />
      </div>
    </>
  );
};

export default DiaryDetailPage;
