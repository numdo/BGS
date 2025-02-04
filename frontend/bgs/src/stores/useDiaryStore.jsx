import axios from 'axios';
import { create } from 'zustand'
const useDiaryStore = create((set) => ({
    diaries: [],
    setDiaries: async (userId) => {
        const accessToken = localStorage.getItem("accessToken")
        axios.get('https://i12c209.p.ssafy.io/api/diaries', {
            params: {
                userId: userId,
                page: 1,
                pageSize: 50,
            },
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
        }).then((res) => {
            console.log("다이어리 조회 성공", res.data)
            set({ diaries: res.data })
        }).catch((err) => {
            console.log(err)
        })
    },
    deleteDiary: async (diaryId) => {
        const accessToken = localStorage.getItem("accessToken")
        axios.delete(`https://i12c209.p.ssafy.io/api/diaries/${diaryId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
        }).then(res => {
            console.log("다이어리 삭제 성공", res)
            set((state) => ({ diaries: state.diaries.filter((diary) => diary.diaryId !== diaryId) }))
        }).catch(err => {
            console.log(err)
        })

    }
}))

export default useDiaryStore