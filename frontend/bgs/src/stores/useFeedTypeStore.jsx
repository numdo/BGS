import { create } from "zustand";

const useFeedTypeStore = create((set) => ({
  feedType: JSON.parse(localStorage.getItem("feedType")) || "diary",
  setFeedType: (FeedType) => {
    localStorage.setItem("feedType", JSON.stringify(FeedType));
    set({ feedType: FeedType });
  },
  evaluationStatus: "ongoing",
  setEvaluationStatus: (EvaluationStatus) => {
    set({ evaluationStatus: EvaluationStatus });
  },
}));

export default useFeedTypeStore;
