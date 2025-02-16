import { create } from "zustand";

const useUserStore = create((set) => ({
  me: {
    userId: 0,
    name: "",
    nickname: "",
    birthDate: "",
    sex: "",
    height: 0,
    weight: 0,
    degree: 0,
    introduction: "",
    totalWeight: 0,
    strickAttendance: 0,
    lastAttendance: "",
    coin: 0,
    profileImageUrl: "",
    accountType: "",
  },
  user: {
    userId: 0,
    nickname: "",
    introduce: "",
    profileImageUrl: "",
  },
  setUser: (userData) => set({ user: userData }),
  setMe: (userData) => set({ me: userData }),
}));

export default useUserStore;
