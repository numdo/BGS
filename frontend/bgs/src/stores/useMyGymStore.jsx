// src/stores/useMyGymStore.jsx
import { create } from 'zustand'
import axios from 'axios'

const useMyGymStore = create((set, get) => ({
  // 전체 화면 배경색 → DB에 backgroundColor로 저장/불러오기
  pageBgColor: "#FFFFFF",

  // 폴리곤(마이짐 벽) 색 → DB에 wallColor로 저장/불러오기
  wallColor: "#F5F1D9",

  // 아이템들(places)
  // 각 아이템: { id(placeId), itemId, x, y, flipped(rotated), deleted, ... }
  items: [],

  // setter
  setPageBgColor: (color) => set({ pageBgColor: color }),
  setWallColor: (color) => set({ wallColor: color }),
  setItems: (newItems) => set({ items: newItems }),

  // GET /api/mygyms/{userId}
  fetchMyGym: async (userId) => {
    try {
      const token = localStorage.getItem("accessToken")
      const res = await axios.get(`https://i12c209.p.ssafy.io/api/mygyms/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 예) res.data = {
      //   backgroundColor: "#FFFFFF",
      //   wallColor: "#000000",
      //   places: [
      //     { placeId, itemId, x, y, rotated, deleted },
      //     ...
      //   ]
      // }
      set({
        pageBgColor: res.data.backgroundColor,
        wallColor: res.data.wallColor,
        items: res.data.places.map(place => ({
          id: place.placeId,
          itemId: place.itemId,
          x: place.x,
          y: place.y,
          flipped: place.rotated ?? false,
          deleted: place.deleted ?? false,
        })),
      });
      console.log("fetchMyGym 성공:", res.data);
    } catch (err) {
      console.error("fetchMyGym 에러:", err);
    }
  },

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
