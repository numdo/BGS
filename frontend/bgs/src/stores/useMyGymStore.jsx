// src/stores/useMyGymStore.jsx
import { create } from 'zustand'
import axios from 'axios'

const useMyGymStore = create((set) => ({
  items: [],
  roomColor: "#F5F1D9",
  
  setItems: (newItems) => set({ items: newItems }),
  setRoomColor: (color) => set({ roomColor: color }),
  
  // 예: 서버에서 마이짐 데이터 불러오기
  fetchMyGym: async (userId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get(`https://i12c209.p.ssafy.io/api/mygym/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // 응답 데이터(배치 정보, 색상 등)를 Zustand state에 넣음
      set({
        items: res.data.places.map(place => ({
          id: place.placeId,
          itemId: place.itemId,
          x: place.x,
          y: place.y,
          flipped: place.rotated,
          // etc...
        })),
        roomColor: res.data.wallColor, // 또는 backgroundColor
      });
      console.log("마이짐 조회 성공", res.data);
    } catch (err) {
      console.error("마이짐 조회 에러:", err);
    }
  },

  // 예: 서버에 마이짐 정보 저장
  updateMyGym: async (userId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const state = get(); // 현재 store 상태

      // items → PlaceRequestDto 형태로 변환
      const places = state.items.map(item => ({
        placeId: item.id,
        itemId: item.itemId,
        x: item.x,
        y: item.y,
        rotated: item.flipped,
        deleted: false, // 필요에 따라 설정
      }));

      const requestBody = {
        userId: userId,
        backgroundColor: state.roomColor,
        wallColor: state.roomColor, // 둘 다 같은 색이라면
        places: places,
      };

      const res = await axios.post(`https://i12c209.p.ssafy.io/api/mygym/${userId}`, requestBody, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("마이짐 업데이트 성공", res.data);
    } catch (err) {
      console.error("마이짐 업데이트 에러:", err);
    }
  },
}));

export default useMyGymStore;
