// src/stores/useCoinStore.js
import { create } from "zustand";

// 코인 관련 전역 스토어
const useCoinStore = create((set) => ({
  coinCount: 0,
  setCoinCount: (newCount) => set({ coinCount: newCount }),
  addCoin: (amount) =>
    set((state) => ({ coinCount: state.coinCount + amount })),
  subtractCoin: (amount) =>
    set((state) => ({ coinCount: state.coinCount - amount })),
}));

export default useCoinStore;
