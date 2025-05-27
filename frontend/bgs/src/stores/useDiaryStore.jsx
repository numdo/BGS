import { create } from 'zustand'

const useDiaryStore = create((set) => ({
    diaries: [],
    setDiaries: (Diaries)=>{
        set({diaries:Diaries})
    }
}))

export default useDiaryStore