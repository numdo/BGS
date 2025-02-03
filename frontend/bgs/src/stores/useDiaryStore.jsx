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
            diaries = res.data.content
        }).catch((err) => {
            console.log(err)
        })
    }
}))

export default useDiaryStore