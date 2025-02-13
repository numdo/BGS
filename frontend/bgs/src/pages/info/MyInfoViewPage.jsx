import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../stores/useUserStore";
import TopBar from "../../components/bar/TopBar";
import BottomBar from "../../components/bar/BottomBar";
import logoutIcon from "../../assets/icons/signout.svg"; // ✅ 로그아웃 아이콘
import myinfo from "../../assets/icons/myinfo.png";
import { handleLogout } from "../../api/Auth";
import { deleteUser } from "../../api/User";

export default function MyInfoViewPage() {
  const navigate = useNavigate();
  const { me } = useUserStore();

  // ✅ 회원 탈퇴 처리 함수
  const handleDeleteUser = () => {
    const isConfirmed = window.confirm("정말로 탈퇴하시겠습니까?");
    if (isConfirmed) {
      deleteUser();
      alert("회원 탈퇴가 완료되었습니다");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ✅ 상단바 */}
      <div className="relative">
        <TopBar />
        {/* ✅ 로그아웃 버튼 (상단바 우측) */}
        <button
          onClick={() => handleLogout(navigate)}
          className="absolute top-3.5 right-4"
        >
          <img src={logoutIcon} alt="로그아웃" className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pt-4 max-w-3xl mx-auto w-full pb-16">
        {/* ✅ 프로필 섹션 */}
        <div className="relative flex flex-col items-center w-full">
          {/* 프로필 이미지 */}
          <img
            src={me.profileImageUrl || myinfo}
            alt="Profile"
            className="rounded-full h-28 w-28 border border-gray-300"
          />

          {/* 닉네임 */}
          <h2 className="mt-2 text-xl font-semibold">
            {me.nickname || "닉네임 없음"}
          </h2>

          {/* 자기소개 */}
          <p className="text-gray-500 text-center px-4">
            {me.introduction || "자기소개 없음"}
          </p>

          {/* ✅ 프로필 수정 버튼 */}
          <button
            onClick={() => navigate("/myinfoedit")}
            className="mt-4 bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            프로필 수정
          </button>
        </div>

        {/* ✅ 유저 정보 (input 대신 div로 변경) */}
        <div className="mt-6 bg-white shadow-md rounded-lg p-4 w-full max-w-xl">
          {[
            { label: "이름", value: me.name || "정보 없음" },
            { label: "생년월일", value: me.birthDate || "정보 없음" },
            { label: "성별", value: me.sex || "정보 없음" },
            {
              label: "키 (cm)",
              value: me.height ? `${me.height} cm` : "정보 없음",
            },
            {
              label: "몸무게 (kg)",
              value: me.weight ? `${me.weight} kg` : "정보 없음",
            },
            {
              label: "총 운동량",
              value: me.totalWeight ? `${me.totalWeight} kg` : "정보 없음",
            },
            {
              label: "연속 출석일",
              value: me.strickAttendance
                ? `${me.strickAttendance} 일`
                : "정보 없음",
            },
            { label: "최근 출석일", value: me.lastAttendance || "정보 없음" },
            { label: "보유 코인", value: me.coin ? `${me.coin} 개` : "0 개" },
          ].map((item, index) => (
            <div
              key={index}
              className="py-3 border-b last:border-none flex justify-between"
            >
              <span className="text-sm font-medium text-gray-600">
                {item.label}
              </span>
              <span className="text-sm text-gray-800">{item.value}</span>
            </div>
          ))}
        </div>

        {/* ✅ 회원 탈퇴 (버튼 스타일 없이 텍스트만 표시) */}
        <div
          onClick={handleDeleteUser}
          className="w-full max-w-xl mt-6 cursor-pointer"
        >
          <hr className="border-gray-300 my-4" /> {/* 상단 구분선 */}
          <p className="text-right text-red-600 font-semibold py-3 hover:text-red-700">
            회원 탈퇴
          </p>
        </div>
      </div>

      {/* ✅ 하단바 공간 확보 */}
      <div className="pb-16">
        <BottomBar />
      </div>
    </div>
  );
}
