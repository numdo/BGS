// src/stores/useMyGymStore.jsx
import { create } from "zustand";

const useMyGymStore = create((set) => ({
  myGym: {
    places: [],
    backgroundColor: "",
    wallColor: "",
    userId: "",
    nickname: "",
    flowed : true,
  },
  setMyGym: (MyGym) => set({ myGym: MyGym }),
}));

export default useMyGymStore;
