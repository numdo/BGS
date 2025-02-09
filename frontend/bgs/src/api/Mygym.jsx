// src/api/Mygym.jsx
import axios from "axios";
const BASE_URL = "https://i12c209.p.ssafy.io/";
// 사용자ID 받아 해당 사용자의 마이짐의 정보 GET요청
export async function getMygym(userId) {
  try {
    const token = localStorage.getItem("accessToken")
    const response = await axios.get(BASE_URL + `api/mygyms/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    console.log(response)
    return response.data
  } catch (error) {
    throw error;
  }
}

// fetchMyGym: async (userId) => {
//     try {
//       const token = localStorage.getItem("accessToken")
//       const res = await axios.get(`https://i12c209.p.ssafy.io/api/mygyms/${userId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       set({
//         pageBgColor: res.data.backgroundColor,
//         wallColor: res.data.wallColor,
//         items: res.data.places.map(place => ({
//           id: place.placeId,
//           itemId: place.itemId,
//           x: place.x,
//           y: place.y,
//           flipped: place.rotated ?? false,
//           deleted: place.deleted ?? false,
//         })),
//       });
//       console.log("fetchMyGym 성공:", res.data);
//     } catch (err) {
//       console.error("fetchMyGym 에러:", err);
//     }
//   },

// object = 
// {
//     "backgroundColor": "#FFFFFF",
//     "wallColor": "#000000",
//     "places": [
//       {
//         "placeId": 1,
//         "itemId": 101,
//         "x": 10,
//         "y": 20,
//         "deleted": true,
//         "rotated": true
//       },
//       {
//         "placeId": 2,
//         "itemId": 102,
//         "x": 30,
//         "y": 40,
//         "deleted": false,
//         "rotated": false
//       },
//       {
//         "placeId": null,
//         "itemId": 103,
//         "x": 50,
//         "y": 60,
//         "deleted": false,
//         "rotated": true
//       }
//     ]
// }  
// 마이짐정보 아이템,배경색,polygon색, PUT요청 서버에 업데이트,
// 업데이트 전, handleFinishEdit에서 불필요한 필드를 제거한 후 객체 전송
export async function updateMygym(userId, object) {
  try {
    const token = localStorage.getItem("accessToken")
    console.log("object", object)
    const response = await axios.put(BASE_URL + `api/mygyms/${userId}`, object, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    console.log("mygym update",response)
    return response.data
  } catch (error) {
    throw error;
  }
}

// 방명록 목록 조회
export async function getGuestBooks(userId) {
  try {
    const token = localStorage.getItem("accessToken");
    // 정렬 조건 추가: 최신 항목부터 조회
    const response = await axios.get(
      `${BASE_URL}api/mygyms/${userId}/guestbooks?page=1&pageSize=10&sort=createdAt,desc`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}


// 방명록 추가
export async function createGuestBooks(userId, object) {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.post(`${BASE_URL}api/mygyms/${userId}/guestbooks`, object, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    // 만약 백엔드가 생성된 방명록 객체를 반환하지 않는다면,
    // 새로 추가한 방명록 정보를 별도로 구성해서 반환해야 할 수도 있습니다.
    return response.data;
  } catch (error) {
    throw error;
  }
}

// 방명록 삭제
export async function deleteGuestBook(ownerId, guestbookId) {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.delete(
      `${BASE_URL}api/mygyms/${ownerId}/guestbooks/${guestbookId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

// 방명록 업데이트 (PATCH) - 삭제 처리를 위해 deleted: true 등을 보낼 수 있음
export async function updateGuestBook(userId, guestbookId, payload) {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.patch(
      `${BASE_URL}api/mygyms/${userId}/guestbooks/${guestbookId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}
