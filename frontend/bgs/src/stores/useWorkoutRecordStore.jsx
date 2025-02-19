import {create} from "zustand";
import { getWorkoutRecord } from "../api/Stat";

const useWorkoutRecordStore = create((set) => ({
  workoutRecord: null,
  loading: false,
  error: null,
  fetchWorkoutRecord: async () => {
    set({ loading: true, error: null });
    try {
      const record = await getWorkoutRecord();
      set({ workoutRecord: record, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },
}));

export default useWorkoutRecordStore;