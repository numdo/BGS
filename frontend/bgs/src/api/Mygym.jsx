import axios from "axios";
const BASE_URL = "https://i12c209.p.ssafy.io/";

export async function getMygym(userId) {
  try {
    const token = localStorage.getItem("accessToken")
    const response = await axios.get(BASE_URL + `api/mygyms/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
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
export async function updateMygym(userId, object) {
  try {
    const token = localStorage.getItem("accessToken")
    console.log("object", object)
    const response = await axios.put(BASE_URL + `api/mygyms/${userId}`, object, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    console.log("mygym update")
    return response.data
  } catch (error) {
    throw error;
  }
}

export async function getGuestBooks(userId) {
  try {
    const response = await axios.get(BASE_URL + `api/mygyms/${userId}/guestbooks`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  } catch (error) {
    throw error;
  }
}

// object =
// {
//     "content": "안녕하세요! 방문을 환영합니다!!!!!!!!!!!!"
// }
export async function createGuestBooks(userId, object) {
  try {
    const response = await axios.post(BASE_URL + `api/mygyms/${userId}/guestbooks`, object, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  } catch (error) {
    throw error;
  }
}
