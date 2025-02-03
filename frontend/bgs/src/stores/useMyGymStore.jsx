// // 임시입니다
// import { create } from "zustand";
// import axios from "axios";

// export const useMyGymStore = create((set) => ({
//   loaditems: [],
//   loadGymRoom: async () => {
//     const token = localStorage.getItem("accessToken")
//     const res = await axios.get(`/api/mygym/`,{
//         headers:{
//             Authorization:`Bearer ${token}`,
//             "Content-Type":"application/json",
//         },
//     });
//     console.log(res.data)
//     // set({ loaditems: JSON.parse(res.data.itemsJson) });
    
//   },
//   saveGymRoom: async (userId, items) => {
//     await axios.post(`/api/mygym/`, { itemsJson: JSON.stringify(items) });
//   },
// }));
