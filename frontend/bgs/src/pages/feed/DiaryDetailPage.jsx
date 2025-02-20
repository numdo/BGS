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
import BeatLoader from "../../components/common/LoadingSpinner";
import { showInformAlert } from "../../utils/toastrAlert";
import DeleteConfirmAlert from "../../components/common/DeleteConfirmAlert";

const API_URL = "/diaries";

const DiaryDetailPage = () => {
  const { me } = useUserStore();
  const { diaryId } = useParams();
  const navigate = useNavigate();
  const [feed, setFeed] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likedCount, setLikedCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(true);
  const [isWorkoutsOpen, setIsWorkoutsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [comments, setComments] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // 댓글 목록 불러오기
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axiosInstance.get(`${API_URL}/${diaryId}/comments`, {
          params: {
            page: 1,
            pageSize: 100,
          },
        });
        setComments(response.data);
      } catch (error) {
        console.error("댓글 불러오기 오류:", error);
      }
    };

    fetchComments();
  }, [diaryId, refreshKey]);

  // 게시글 데이터 불러오기
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

  // 댓글 작성 함수 (오류 해결을 위해 추가)
  const handleCommentSubmit = async (content) => {
    try {
      await axiosInstance.post(`${API_URL}/${diaryId}/comments`, {
        diaryId,
        content,
      });
      setRefreshKey((prev) => prev + 1); // 댓글 추가 후 목록 갱신
    } catch (error) {
      console.error("댓글 작성 오류:", error);
    }
  };

  // 데이터 로딩 전 로딩 스피너 표시
  if (!feed)
    return (
      <div className="flex items-center justify-center h-screen">
        <BeatLoader />
      </div>
    );

  // 프로필 클릭 시 해당 유저 프로필 페이지로 이동하는 함수
  const handleProfileClick = () => {
    if (feed.userId === me.userId) {
      navigate(`/myinfo`);
    } else {
      navigate(`/profile/${feed.userId}`);
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

  // 게시글 수정 함수
  const handleUpdate = () => {
    if (feed.userId !== me.userId) {
      showInformAlert("본인의 게시물이 아니면 수정할 수 없습니다.");
    } else {
      navigate(`/workoutupdate/${diaryId}`);
    }
  };

  // 삭제 버튼 클릭 시 삭제 확인 모달 노출
  const handleDeleteClick = () => {
    setConfirmDelete(true);
  };

  // 삭제 확인 모달에서 확인 버튼 클릭 시 호출되는 함수
  const confirmDeleteDiary = async () => {
    try {
      await axiosInstance.delete(`${API_URL}/${diaryId}`);
      navigate("/feeds");
    } catch (error) {
      console.error("삭제 오류:", error);
    } finally {
      setConfirmDelete(false);
    }
  };

  // 삭제 취소 함수
  const cancelDelete = () => {
    setConfirmDelete(false);
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

  // 댓글 삭제 함수
  const onDelete = (commentId) => {
    setComments((prev) =>
      prev.filter((comment) => comment.commentId !== commentId)
    );
    axiosInstance.delete(`/diaries/${diaryId}/comments/${commentId}`);
  };

  // 댓글 수정 함수
  const onUpdate = (commentId, content) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.commentId === commentId ? { ...comment, content } : comment
      )
    );
    axiosInstance.patch(`/diaries/${diaryId}/comments/${commentId}`, {
      commentId,
      content,
    });
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
              <p className="font-bold cursor-pointer" onClick={handleProfileClick}>
                {feed.writer}
              </p>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(feed.createdAt), {
                  addSuffix: true,
                  locale: ko,
                })}
              </p>
            </div>

            {/* 메뉴바 */}
            <div className="ml-auto relative">
              {(feed.userId === me.userId || me.role === "ADMIN") && (
                <button onClick={toggleMenu} className="text-xl">
                  ⋮
                </button>
              )}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 bg-white border shadow-lg rounded-md w-40 z-10">
                  <ul>
                    <li
                      onClick={handleUpdate}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                    >
                      수정
                    </li>
                    <li
                      onClick={handleDeleteClick}
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
            <div className="mt-2">
              {feed.hashtags.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className="p-1 bg-gray-200 rounded-full text-sm mr-2"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <div className="flex justify-end mr-3">
              <img src={fire_colored} alt="" />
              <div className="text-gray-500 m-1">{likedCount}</div>
              <img src={chat} alt="" />
              <div className="text-gray-500 m-1">{comments.length}</div>
            </div>
            <div className="flex items-center justify-around m-2">
              <div>
                <p className="flex text-gray-700 cursor-pointer">
                  {isLiked ? (
                    <img onClick={onLikeToggle} src={fire_colored} alt="좋아요" />
                  ) : (
                    <img onClick={onLikeToggle} src={fire} alt="좋아요" />
                  )}
                </p>
              </div>
              <div className="flex">
                <img
                  onClick={() => {
                    setIsCommentsOpen(!isCommentsOpen);
                    if (isWorkoutsOpen) setIsWorkoutsOpen(false);
                  }}
                  src={chat}
                  alt="댓글 토글"
                />
              </div>
              <div>
                <img
                  onClick={() => {
                    setIsWorkoutsOpen(!isWorkoutsOpen);
                    if (isCommentsOpen) setIsCommentsOpen(false);
                  }}
                  src={fitness_center}
                  alt="운동 내역 토글"
                />
              </div>
            </div>
          </div>

          {/* 댓글 입력창 & 댓글 목록 */}
          {isCommentsOpen && (
            <div className="mt-6">
              <CommentInput onCommentSubmit={handleCommentSubmit} />
              <CommentList
                key={refreshKey}
                comments={comments}
                userId={me.userId}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            </div>
          )}
          {isWorkoutsOpen && (
            <div className="mt-6">
              {/* 운동 세트 정보 */}
              <div className="space-y-4">
                {feed.diaryWorkouts.length === 0 && (
                  <div className="p-4 bg-gray-100 rounded-lg shadow">
                    <p>운동 내역이 없습니다</p>
                  </div>
                )}
                {(feed.diaryWorkouts || []).map((workout) => (
                  <div
                    key={workout.diaryWorkoutId}
                    className="p-4 bg-gray-100 rounded-lg shadow"
                  >
                    <h3 className="text-lg font-semibold text-gray-800">
                      {workout.workoutName}
                    </h3>
                    <div className="mt-2 space-y-2">
                      {workout.sets?.map((set, index) => (
                        <div
                          key={`set-${workout.diaryWorkoutId}-${index}`}
                          className="flex justify-between text-sm"
                        >
                          <span className="font-medium">세트 {index + 1}:</span>
                          {set.workoutTime ? (
                            <span className="text-gray-900">
                              {set.workoutTime}초
                            </span>
                          ) : (
                            <span>
                              {set.weight ? `${set.weight}kg × ` : ""}
                              {set.repetition ? `${set.repetition}회` : ""}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <BottomBar />
      </div>

      {/* 삭제 확인 모달 */}
      {confirmDelete && (
        <DeleteConfirmAlert
          message="정말 삭제하시겠습니까?"
          onConfirm={confirmDeleteDiary}
          onCancel={cancelDelete}
        />
      )}

      {/* 예시: 화면 하단에 등록(운동 기록하기) 버튼 추가 */}
    </>
  );
};

export default DiaryDetailPage;
