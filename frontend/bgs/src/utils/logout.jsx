import axiosInstance from "./axiosInstance";

export const handleLogout = async (navigate) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");

    if (!accessToken || !userId) {
      console.warn("이미 로그아웃됨");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      navigate("/login");
      return;
    }

    // ✅ 서버에 로그아웃 요청 (토큰 무효화)
    await axiosInstance.post(`/users/logout`, null, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: { userId },
    });

    alert("로그아웃 되었습니다.");
  } catch (error) {
    console.error("로그아웃 실패:", error);
    alert("로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.");
  } finally {
    // ✅ 에러 여부와 관계없이 로컬 스토리지 삭제 (완전 초기화)
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");

    // ✅ 로그인 페이지로 이동
    navigate("/login");
  }
};
