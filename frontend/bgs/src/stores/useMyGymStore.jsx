// src/stores/useMyGymStore.jsx
import { create } from 'zustand'
import axios from 'axios'

const useMyGymStore = create((set,get) => ({
  myGym:{},
  setMyGym : (MyGym)=>set({myGym:MyGym}),
  pageBgColor: "#FFFFFF",
  wallColor: "#F5F1D9",
  items: [],

  setPageBgColor: (color) => set({ pageBgColor: color }),
  setWallColor: (color) => set({ wallColor: color }),
  setItems: (newItems) => set({ items: newItems }),

  // PUT /api/mygyms/{userId}
  updateMyGym: async (userId) => {
    try {
      const token = localStorage.getItem("accessToken")
      const state = get();

      // items -> places
      const places = state.items.map(item => ({
        placeId: item.id,          // DB pk (null이면 새 record)
        itemId: item.itemId ?? 0,  // 운동기구 식별
        x: item.x,
        y: item.y,
        rotated: item.flipped ?? false,
        deleted: item.deleted ?? false,
      }));

      const requestBody = {
        backgroundColor: state.pageBgColor,
        wallColor: state.wallColor,
        places: places,
      };

      const res = await axios.put(`https://i12c209.p.ssafy.io/api/mygyms/${userId}`, requestBody, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("updateMyGym 성공:", res.data);
    } catch (err) {
      console.error("updateMyGym 에러:", err);
    }
  },
}));

export default useMyGymStore;
