import { create } from "zustand";

const useFeedTypeStore = create((set) => ({
  feedType: "diary",
  setFeedType: (FeedType) => {
    set({ feedType: FeedType });
  },
}));

export default useFeedTypeStore;
