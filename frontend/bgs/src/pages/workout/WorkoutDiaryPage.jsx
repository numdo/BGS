import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import BottomBar from "../../components/bar/BottomBar";
import TopBar from "../../components/bar/TopBar";
import { getDiary } from "../../api/Diary";
import axiosInstance from "../../utils/axiosInstance";
import Slider from "react-slick";
import FeedDefaultImage from "../../assets/images/feeddefaultimage.png";

export default function WorkoutDiaryPage() {
  const { diaryId } = useParams();
  const [diary, setDiary] = useState(null);

  // 전체 운동 목록 (workoutId, workoutName, part 등)
  const [allWorkouts, setAllWorkouts] = useState([]);

  // react-slick 슬라이더 설정
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  // 1) 전체 운동 목록 불러오기 (예: /workouts)
  useEffect(() => {
    // 실제 API 경로에 맞게 수정하세요
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
    getDiary(diaryId).then((fetchedDiary) => {
      setDiary(fetchedDiary);
      console.log("다이어리 데이터:", fetchedDiary);
    });
  }, [diaryId]);

  // 3) workoutId → 운동이름 매핑 함수 (백엔드에서 내려주는 값이 없을 경우)
  const getWorkoutName = (workoutId) => {
    const found = allWorkouts.find(
      (w) => Number(w.workoutId) === Number(workoutId)
    );
    if (found) {
      return found.workoutName; // 예: '벤치프레스'
    } else {
      return `운동 ID: ${workoutId}`; 
    }
  };

  if (!diary)
    return <div className="text-center text-lg py-10">Loading...</div>;

  return (
    <>
      <TopBar />
      <div className="max-w-2xl mx-auto p-4 space-y-6">

        {/* 작성자 정보 */}
        <div className="flex items-center gap-4">
          <img
            src={diary.profileImageUrl}
            alt="프로필 이미지"
            className="w-12 h-12 rounded-full border-2 border-gray-300"
          />
          <div>
            <p className="font-semibold text-lg">{diary.writer}</p>
            <p className="text-gray-500 text-sm">{diary.workoutDate}</p>
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
            const workoutName = workout.workoutName || getWorkoutName(workout.workoutId);

            return (
              <div key={workout.diaryWorkoutId} className="p-4 bg-gray-100 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-800">{workoutName}</h3>
                <div className="mt-2 space-y-2">
                  {workout.sets?.map((set, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="font-medium">
                        세트 {index + 1}:
                      </span>
                      {set.workoutTime ? (
                        // 운동 시간이 있으면 시간만 출력
                        <span className="text-gray-500">{set.workoutTime}초</span>
                      ) : (
                        // 운동 시간이 없으면 무게와 횟수만 출력
                        <span>
                          {set.weight ? `${set.weight}kg × ` : ""}
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
    </>
  );
}
