import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../stores/useUserStore";
import TopBar from "../../components/bar/TopBar";
import settings from "../../assets/icons/settings.svg";
import myinfo from "../../assets/icons/myinfo.png";
import BottomBar from "../../components/bar/BottomBar";
import { handleLogout } from "../../api/Auth";
import { deleteUser, getUser } from "../../api/User";

export default function MyInfoViewPage() {
  const navigate = useNavigate();
  const { me } = useUserStore(); // ✅ Zustand에서 유저 데이터 가져오기

  // ✅ 설정 메뉴 상태 추가
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <div className="px-6 pt-2 max-w-3xl mx-auto">
        {/* ✅ 상단 프로필 섹션 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={me.profileImageUrl || myinfo} // ✅ 프로필 이미지 (없으면 기본 이미지)
              alt="Profile"
              className="rounded-full h-24 w-24"
            />
            <div className="ml-6">
              <h2 className="mt-4 text-2xl font-semibold text-gray-800">
                {me.nickname || "닉네임 없음"}
              </h2>
              <p className="text-gray-600 mt-2">
                {me.introduction || "자기소개 없음"}
              </p>
            </div>
          </div>
          {/* ✅ 설정 버튼 (클릭 시 메뉴 열림) */}
          <button onClick={() => setIsSettingsOpen(!isSettingsOpen)}>
            <img src={settings} alt="설정" />
          </button>

          {/* ✅ 설정 드롭다운 메뉴 */}
          {isSettingsOpen && (
            <div className="absolute right-3 top-32 w-36 rounded-md bg-gray-100 border border-gray-200 ring-1 ring-black ring-opacity-5 z-10">
              <div role="menu">
                <div
                  onClick={() => navigate("/myinfoview")}
                  className="hover:bg-gray-100 p-2"
                >
                  <p className="inline-block align-middle">프로필</p>
                </div>
                <div className="border-b border-gray-200"></div>
                <div
                  onClick={() => handleLogout(navigate)}
                  className="hover:bg-gray-100 p-2 border-b border-gray-200"
                >
                  <p className="inline-block align-middle">로그아웃</p>
                </div>
                <div
                  onClick={handleDeleteUser}
                  className="text-danger hover:bg-gray-100 p-2"
                >
                  <p className="inline-block align-middle">회원탈퇴</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ✅ 유저 정보 (읽기 전용 입력 필드 디자인) */}
        <div className="mt-4">
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
            <div key={index} className="space-y-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">
                {item.label}
              </label>
              <input
                type="text"
                value={item.value}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white-50 focus:outline-none"
              />
            </div>
          ))}
        </div>

        {/* ✅ 버튼 그룹 */}
        <div className="flex flex-col space-y-4 mt-6">
          <button
            onClick={() => navigate("/myinfoedit")}
            className="bg-primary text-white py-2 px-4 rounded-md text-center"
          >
            수정하기
          </button>
          <button
            onClick={() => navigate("/change-password")}
            className="bg-gray-500 text-white py-2 px-4 rounded-md text-center"
          >
            비밀번호 변경
          </button>
        </div>
      </div>
      <BottomBar />
    </div>
  );
}
