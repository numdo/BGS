import FeedItem from "./FeedItem";
import BeatLoader from "../common/LoadingSpinner";

const EvaluationFeedList = ({
  evaluations,
  loaderRef,
  loading,
  onImageClick,
  hasMore,
}) => {
  return (
    <div className="w-full flex-shrink-0 p-4">
      <div className="grid grid-cols-3 gap-2">
        {evaluations.map((feed, index) =>
          feed.imageUrl ? (
            <FeedItem
              key={`${feed.evaluationId}-${index}`}
              feed={feed}
              onClick={() => onImageClick(feed.evaluationId)}
            />
          ) : null
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

export default EvaluationFeedList;
