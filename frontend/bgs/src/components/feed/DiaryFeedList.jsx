import FeedItem from "./FeedItem";
import BeatLoader from "../common/LoadingSpinner";

const DiaryFeedList = ({
  feeds,
  loaderRef,
  loading,
  onImageClick,
  hasMore,
}) => {
  return (
    <div className="w-full flex-shrink-0 p-4">
      <div className="grid grid-cols-3 gap-2">
        {feeds.map(
          (feed, index) =>
            feed.imageUrl && (
              <FeedItem
                key={index}
                feed={feed}
                onClick={() => onImageClick(feed.diaryId || feed.evaluationId)}
              />
            )
        )}
      </div>
      {hasMore && (
        <div
          ref={loaderRef}
          className="h-10 mt-4 flex justify-center items-center"
        >
          {loading && <BeatLoader color="#2563eb" size={15} margin={2} />}
        </div>
      )}
    </div>
  );
};

export default DiaryFeedList;
