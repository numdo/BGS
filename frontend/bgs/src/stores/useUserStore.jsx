import axios from 'axios';
import { create } from 'zustand'

const useUserStore = create((set) => ({
    user: {
        name: '',
        nickname: '',
        birthDate: '',
        sex: '',
        height: 0,
        weight: 0,
        degree: 0,
        introduce: '',
        totalWeight: 0,
        strickAttendance: 0,
        lastAttendance: '',
        coin: 0,
        profileImageUrl: '',
    },
    // setUser: (userData) => set({ user: userData }),
    fetchUser: async () => {
        try {
            const token = localStorage.getItem("accessToken")
            const userId = localStorage.getItem("userId")
            const response = await axios.get(`https://i12c209.p.ssafy.io/api/users/me`, {
                headers: {
                    Authorization: `Bearer ${token}`, // 🔹 헤더에 토큰 추가
                    "Content-Type": "application/json",
                },
            });
            set({ user: response.data })
            console.log("userId로 데이터 불러오기 성공", response.data)
        } catch (error) {
            console.log("Error fetching user: ", error)
        }
    }
}));

export default useUserStore;