import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import BottomBar from "../../components/bar/BottomBar";
import TopBar from "../../components/bar/TopBar";
import { getDiary } from "../../api/Diary";
import Slider from "react-slick";
import FeedDefaultImage from "../../assets/images/feeddefaultimage.png";

export default function WorkoutDiaryPage() {
  const { diaryId } = useParams();
  const [diary, setDiary] = useState(null);
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };
  useEffect(() => {
    getDiary(diaryId).then((fetchedDiary) => {
      setDiary(fetchedDiary);
      console.log(fetchedDiary);
    });
  }, [diaryId]);
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
          {diary.hashtags &&
            diary.hashtags.map((tag, index) => (
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
          {diary.diaryWorkouts.map((workout) => (
            <div
              key={workout.diaryWorkoutId}
              className="p-4 bg-gray-100 rounded-lg shadow"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                운동 ID: {workout.workoutId}
              </h3>
              <div className="mt-2 space-y-2">
                {workout.sets.map((set) => (
                  <div
                    key={set.workoutSetId}
                    className="flex justify-between text-sm"
                  >
                    <span className="font-medium">
                      세트 {set.workoutSetId}:
                    </span>
                    <span>
                      {set.weight}kg × {set.repetition}회
                    </span>
                    <span className="text-gray-500">{set.workoutTime}초</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
