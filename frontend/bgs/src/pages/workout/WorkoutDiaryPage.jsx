import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BottomBar from "../../components/bar/BottomBar";
import TopBar from "../../components/bar/TopBar";
import { getDiary, deleteDiary } from "../../api/Diary";
import axiosInstance from "../../utils/axiosInstance";
import Slider from "react-slick";
import FeedDefaultImage from "../../assets/images/feeddefaultimage.png";
import MoreIcon from "../../assets/icons/more.svg";
import DeleteConfirmAlert from "../../components/common/DeleteConfirmAlert";

export default function WorkoutDiaryPage() {
  const { diaryId } = useParams();
  const navigate = useNavigate();
  const [diary, setDiary] = useState(null);
  // 전체 운동 목록 (workoutId, workoutName, part 등)
  const [allWorkouts, setAllWorkouts] = useState([]);
  // 더보기 드롭다운 상태 관리
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);
  // 삭제 확인 모달 상태 관리
  const [confirmDelete, setConfirmDelete] = useState(false);

  // react-slick 슬라이더 설정
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  // 1) 전체 운동 목록 불러오기 (예: /diaries/workout)
  useEffect(() => {
    axiosInstance
      .get("diaries/workout", { withCredentials: true })
      .then((res) => {
        setAllWorkouts(res.data); // 예: [{ workoutId: 1, workoutName: '벤치프레스', ...}, ...]
      })
      .catch((err) => {
        console.error("운동 목록 불러오기 실패:", err);
      });
  }, []);

  // 2) Diary 상세 불러오기
  useEffect(() => {
    if (!diaryId) return;
    getDiary(diaryId)
      .then((fetchedDiary) => {
        setDiary(fetchedDiary);
        console.log("다이어리 데이터:", fetchedDiary);
      })
      .catch((err) => {
        console.error("다이어리 불러오기 실패:", err);
      });
  }, [diaryId]);

  // 3) workoutId → 운동이름 매핑 함수 (백엔드에서 내려주는 값이 없을 경우)
  const getWorkoutName = (workoutId) => {
    const found = allWorkouts.find(
      (w) => Number(w.workoutId) === Number(workoutId)
    );
    return found ? found.workoutName : `운동 ID: ${workoutId}`;
  };

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // 삭제 확인 모달에서 확인 버튼 클릭 시 처리
  const confirmDeleteDiary = async () => {
    try {
      await deleteDiary(diaryId);
      // 삭제 후 운동 일지 목록 페이지 등으로 이동 (원하는 페이지로 변경)
      navigate("/workout");
    } catch (error) {
      console.error("삭제 중 오류:", error);
    } finally {
      setConfirmDelete(false);
    }
  };

  if (!diary)
    return <div className="text-center text-lg py-10">Loading...</div>;

  return (
    <>
      <TopBar />
      <div className="max-w-2xl mx-auto p-4 pb-24 space-y-6">
        {/* 프로필 정보와 더보기 버튼을 같은 라인에 배치 */}
        <div className="flex items-center justify-between">
          {/* 좌측: 프로필 이미지, 작성자, 날짜 */}
          <div className="flex items-center gap-4">
            <img
              src={diary.profileImageUrl || "https://via.placeholder.com/48"}
              alt="프로필 이미지"
              className="w-12 h-12 rounded-full border-2 border-gray-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/48";
              }}
            />
            <div>
              <p className="font-semibold text-lg">{diary.writer}</p>
              <p className="text-gray-500 text-sm">{diary.workoutDate}</p>
            </div>
          </div>
          {/* 우측: 더보기 버튼 */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown((prev) => !prev);
              }}
              className="p-3 bg-white rounded-full hover:bg-gray-100"
            >
              <img src={MoreIcon} alt="더보기" className="w-8 h-8" />
            </button>
            {openDropdown && (
              <div
                ref={dropdownRef}
                className="absolute top-full right-0 mt-2 w-40 bg-white rounded-md border shadow-md z-20 text-center"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/workoutupdate/${diaryId}`);
                  }}
                  className="block w-full px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                >
                  수정
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDelete(true);
                  }}
                  className="block w-full px-4 py-2 text-red-600 hover:bg-red-50"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 이미지 캐러셀 */}
        <div className="rounded-md overflow-hidden shadow-lg">
          <Slider {...settings}>
            {diary.images && diary.images.length > 0 ? (
              diary.images.map((img) => (
                <img
                  key={img.imageId}
                  src={img.url}
                  alt="운동 이미지"
                  className="w-full h-64 object-cover"
                />
              ))
            ) : (
              <img
                src={FeedDefaultImage}
                alt="기본 이미지"
                className="w-full h-64 object-cover"
              />
            )}
          </Slider>
        </div>

        {/* 운동 내용 */}
        <p className="p-4 bg-gray-100 rounded-lg shadow text-lg">
          {diary.content}
        </p>

        {/* 해시태그 */}
        <div className="flex flex-wrap gap-2">
          {diary.hashtags?.map((tag, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-600 px-3 py-1 text-sm rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* 운동 세트 정보 */}
        <div className="space-y-4">
          {(diary.diaryWorkouts || []).map((workout) => {
            // 만약 diaryWorkouts에 workoutName이 있다면 바로 사용
            const workoutName =
              workout.workoutName || getWorkoutName(workout.workoutId);
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
                    <div key={index} className="flex justify-between text-sm">
                      <span className="font-medium">세트 {index + 1}:</span>
                      {set.workoutTime ? (
                        <span className="text-gray-900">
                          {set.workoutTime}분
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

        {/* 좋아요 수 */}
        <div className="text-right">
          <span className="text-red-500 font-semibold">
            ❤️ {diary.likedCount}
          </span>
        </div>
      </div>
      <BottomBar />

      {/* 삭제 확인 모달 */}
      {confirmDelete && (
        <DeleteConfirmAlert
          message="정말로 삭제하시겠습니까?"
          onConfirm={confirmDeleteDiary}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}
