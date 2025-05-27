import {create} from 'zustand';

const useWorkoutStore = create((set) => ({
  selectedDate: null,  // 선택된 날짜
  workoutDiary: [
    { date: '2025-01-15', exercise: 'Push-up', sets: 3, reps: 15 },
    { date: '2025-01-16', exercise: 'Squat', sets: 4, reps: 20 },
    { date: '2025-01-17', exercise: 'Lunges', sets: 3, reps: 12 },
  ],  // 운동일지 데이터
  setSelectedDate: (date) => set({ selectedDate: date }),  // 선택된 날짜 설정
  getWorkoutsByDate: (date) =>
    set((state) => ({
      filteredWorkouts: state.workoutDiary.filter(
        (entry) => entry.date === date
      ),
    })),
}));

export default useWorkoutStore;