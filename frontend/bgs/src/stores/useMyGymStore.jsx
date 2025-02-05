// src/stores/useMyGymStore.jsx
import { create } from 'zustand'
import axios from 'axios'

const useMyGymStore = create((set, get) => ({
  // 전체 화면 배경색 → DB에 backgroundColor로 저장/불러오기
  pageBgColor: "#FFFFFF",

  // 폴리곤(마이짐 벽) 색 → DB에 wallColor로 저장/불러오기
  wallColor: "#F5F1D9",

  // 아이템들(places)
  // 각 아이템: { id(placeId), itemId, x, y, flipped(rotated), deleted, isNew, ... }
  items: [],

  // setter
  setPageBgColor: (color) => set({ pageBgColor: color }),
  setWallColor: (color) => set({ wallColor: color }),
  setItems: (newItems) => set({ items: newItems }),

  // GET /api/mygyms/{userId} (유저 ID는 URL에 포함해야 함)
  fetchMyGym: async (userId) => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        console.error("fetchMyGym 에러: 인증 토큰 없음");
        return;
      }

      const res = await axios.get(`https://i12c209.p.ssafy.io/api/mygyms/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({
        pageBgColor: res.data.backgroundColor,
        wallColor: res.data.wallColor,
        items: res.data.places.map(place => ({
          id: place.placeId,           // DB에서 받은 placeId
          itemId: place.itemId,
          x: place.x,
          y: place.y,
          flipped: place.rotated ?? false,
          deleted: place.deleted ?? false,
          isNew: false,                // 기존 DB에 있는 아이템은 신규 플래그 false
        })),
      });
      console.log("fetchMyGym 성공:", res.data);
    } catch (err) {
      console.error("fetchMyGym 에러:", err);
    }
  },

  // PUT /api/mygyms (userId 제거, 백엔드에서 토큰 기반으로 처리)
  updateMyGym: async () => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        console.error("updateMyGym 에러: 인증 토큰 없음");
        return;
      }

      const state = get();

      // items -> places 변환 시,
      // 신규 아이템은 isNew 플래그가 true이면 placeId를 null로 전송하여 INSERT 처리되도록 함.
      const places = state.items.map(item => ({
        placeId: item.isNew ? null : item.id,  // 신규 아이템이면 null, 기존 아이템이면 기존 id 사용
        itemId: item.itemId ?? 0,              // 운동기구 식별
        x: item.x,
        y: item.y,
        rotated: item.flipped ?? false,
        deleted: item.deleted ?? false,
      }));

      const requestBody = {
        backgroundColor: state.pageBgColor,
        wallColor: state.wallColor,
        ...(state.items.length > 0 && { places: places }),
      };

      // 디버깅: 전송할 requestBody를 콘솔에 출력
      console.log("updateMyGym 요청 데이터:", requestBody);

      const res = await axios.put(`https://i12c209.p.ssafy.io/api/mygyms`, requestBody, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("updateMyGym 성공:", res.data);
    } catch (err) {
      console.error("updateMyGym 에러:", err);
    }
  },
}));

export default useMyGymStore;
