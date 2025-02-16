import { create } from "zustand";
import { getUser, updateUser, deleteUser, changePassword, checkNickname } from "../api/User";

const useUserStore = create((set) => ({
  me: {
    userId: 0,
    name: "",
    nickname: "",
    birthDate: "",
    sex: "",
    height: 0,
    weight: 0,
    degree: 0,
    introduction: "",
    totalWeight: 0,
    strickAttendance: 0,
    lastAttendance: "",
    coin: 0,
    profileImageUrl: "",
    accountType: "",
  },
  user: {
    userId: 0,
    nickname: "",
    introduce: "",
    profileImageUrl: "",
  },
  setUser: (userData) => set({ user: userData }),
  setMe: (userData) => set({ me: userData }),
  fetchMe: async () => {
    try {
      const data = await getUser(0);
      set({ me: data });
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  },

  // 사용자 정보 업데이트
  updateMe: async (userData) => {
    try {
      const updatedData = await updateUser(userData);
      set({ me: updatedData });
      return updatedData;
    } catch (error) {
      console.error("Error updating user info:", error);
      throw error;
    }
  },

  // 회원 탈퇴
  deleteMe: async () => {
    try {
      const response = await deleteUser();
      // 탈퇴 성공 시 me 상태를 초기화하거나 추가 처리를 할 수 있습니다.
      set({ me: {} });
      return response;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },

  // 비밀번호 변경
  changePassword: async (passwordData) => {
    try {
      const response = await changePassword(passwordData);
      return response;
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  },

  // 닉네임 중복 체크
  checkNickname: async (nickname) => {
    try {
      const response = await checkNickname(nickname);
      return response;
    } catch (error) {
      console.error("Error checking nickname:", error);
      throw error;
    }
  },
}));

export default useUserStore;
