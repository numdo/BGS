// src/stores/weightHistoryStore.jsx
import { create } from "zustand";
import { getWeightHistories } from "../api/Stat";

const useWeightHistoryStore = create((set) => ({
  histories: [],
  loading: false,
  error: null,
  fetchHistories: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getWeightHistories();
      set({ histories: data, loading: false });
    } catch (error) {
      set({ error: error.message || "Error occurred", loading: false });
    }
  },
}));

export default useWeightHistoryStore;
