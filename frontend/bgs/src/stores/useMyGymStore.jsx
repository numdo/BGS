// src/stores/useMyGymStore.jsx
import { create } from 'zustand'
import axios from 'axios'

const useMyGymStore = create((set, get) => ({
  myGym: { places: [] },
  setMyGym: (MyGym) => set({ myGym: MyGym }),
}));

export default useMyGymStore;
