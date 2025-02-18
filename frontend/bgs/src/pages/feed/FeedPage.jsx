// src/pages/FeedPage.js
import { useNavigate } from "react-router-dom";
import useFeedTypeStore from "../../stores/useFeedTypeStore";
import TopBar from "../../components/bar/TopBar";
import BottomBar from "../../components/bar/BottomBar";
import DiaryFeedContainer from "../../components/feed/DiaryFeedContainer";
import EvaluationFeedContainer from "../../components/feed/EvaluationFeedContainer";

const FeedPage = () => {
  const { feedType, setFeedType } = useFeedTypeStore();
  const navigate = useNavigate();

  const handleFeedTypeChange = (type) => {
    setFeedType(type);
  };

  const handleImageClick = (id) => {
    if (feedType === "evaluation") {
      navigate(`/feeds/evaluation/${id}`);
    } else {
      navigate(`/feeds/diary/${id}`);
    }
  };

  return (
    <>
      <TopBar />
      <div className="max-w-4xl mx-auto p-4 h-screen">
        {/* 피드 탭 버튼 */}
        <div className="grid grid-cols-2 gap-2 justify-between mb-4">
          <button
            onClick={() => handleFeedTypeChange("diary")}
            className={`px-4 py-2 bg-white text-gray-700 transition ${
              feedType === "diary" ? "border-b-2 border-primary" : ""
            }`}
          >
            일지
          </button>
          <button
            onClick={() => handleFeedTypeChange("evaluation")}
            className={`px-4 py-2 bg-white text-gray-700 transition ${
              feedType === "evaluation" ? "border-b-2 border-primary" : ""
            }`}
          >
            평가
          </button>
        </div>

        {/* 피드 컨테이너 */}
        <div className="relative w-full flex-grow overflow-auto pb-20">
          {feedType === "diary" && (
            <DiaryFeedContainer onImageClick={handleImageClick} />
          )}
          {feedType === "evaluation" && (
            <EvaluationFeedContainer onImageClick={handleImageClick} />
          )}
        </div>
      </div>

      <button
        onClick={() => {
          if (feedType === "diary") {
            navigate("/workout");
          } else if (feedType === "evaluation") {
            navigate("/evaluationcreate");
          }
        }}
        className="fixed bottom-20 right-4 bg-[#5968eb] text-white font-bold py-5 px-5 rounded-full transition-all duration-300"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="white" />
        </svg>
      </button>
      <BottomBar />
    </>
  );
};

export default FeedPage;
