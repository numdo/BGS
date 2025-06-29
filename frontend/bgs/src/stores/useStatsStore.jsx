// src/stores/statsStore.js
import { create } from "zustand";
import { getWorkoutBalance, getPartVolume } from "../api/Stat";

const useStatsStore = create((set) => ({
  workoutBalance: null,
  partVolume: null,
  loading: false,
  error: null,

  fetchWorkoutBalance: async (scope = "all") => {
    set({ loading: true, error: null });
    try {
      const data = await getWorkoutBalance(scope);
      set({ workoutBalance: data, loading: false });
    } catch (error) {
      console.error("Error fetching workout balance:", error);
      set({ error: error.message || "Error occurred", loading: false });
    }
  },

  fetchPartVolume: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getPartVolume();
      set({ partVolume: data, loading: false });
    } catch (error) {
      console.error("Error fetching part volume:", error);
      set({ error: error.message || "Error occurred", loading: false });
    }
  },
}));

export default useStatsStore;
