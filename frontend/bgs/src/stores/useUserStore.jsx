import create from 'zustand'

const useStore = create((set) => ({
    user: {
        name: '',
        nickname: '',
        birth_date: '',
        sex: '',
        height: 0,
        weight: 0,
        degree: 0,
        introduce: '',
        total_weight: 0,
        strick_attendance: 0,
        last_attendance: '',
        coin: 0,
    },
    setUser: (userData) => set({ user: userData })
}));

export default useStore;