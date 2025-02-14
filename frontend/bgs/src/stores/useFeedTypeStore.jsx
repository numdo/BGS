import { create } from "zustand";

const useFeedTypeStore = create((set) => ({
  feedType: "diary",
  setFeedType: (FeedType) => {
    set({ feedType: FeedType });
  },
  evaluationStatus: "ongoing",
  setEvaluationStatus: (EvaluationStatus) => {
    set({ evaluationStatus: EvaluationStatus });
  },
}));

export default useFeedTypeStore;
