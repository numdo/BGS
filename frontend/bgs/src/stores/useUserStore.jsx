import axios from 'axios';
import { create } from 'zustand'

const useUserStore = create((set) => ({
    user: {
        userId: 0,
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
    setUser: (userData) => set({ user: userData }),
}));

export default useUserStore;