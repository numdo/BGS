import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../stores/useUserStore";
import TopBar from "../../components/bar/TopBar";
import BottomBar from "../../components/bar/BottomBar";
import logoutIcon from "../../assets/icons/signout.svg";
import myinfo from "../../assets/icons/myinfo.png";
import { handleLogout } from "../../api/Auth";
import { changePassword } from "../../api/User";
import BeatLoader from "../../components/common/LoadingSpinner";
import AlertModal from "../../components/common/AlertModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, InputAdornment, TextField } from "@mui/material";

export default function MyInfoViewPage() {
  const navigate = useNavigate();
  const { me } = useUserStore();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [alertData, setAlertData] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  // ✅ 비밀번호 표시/숨기기 상태
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ✅ 비밀번호 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ 비밀번호 유효성 검사
  const isPasswordValid = () => {
    return (
      formData.newPassword.length >= 8 &&
      formData.newPassword === formData.confirmNewPassword
    );
  };

  // ✅ 로그아웃 확인 모달
  const confirmLogout = () => {
    setConfirmData({
      message: "정말 로그아웃 하시겠습니까?",
      confirmText: "로그아웃",
      cancelText: "취소",
      confirmColor: "bg-red-400",
      onConfirm: () => handleLogout(navigate),
    });
  };

  // ✅ 비밀번호 변경 요청
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!isPasswordValid()) {
      setAlertData({
        message:
          "비밀번호는 8자 이상이어야 하며, 확인 비밀번호와 일치해야 합니다.",
      });
      return;
    }

    try {
      setLoading(true);

      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmNewPassword,
      });

      setAlertData({
        message: "비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.",
        success: true,
        navigateTo: "/login", // ✅ "확인" 버튼 클릭 시 로그인 페이지로 이동
      });

      setIsPasswordModalOpen(false);
      localStorage.removeItem("accessToken");
    } catch (err) {
      if (err.response) {
        setAlertData({
          message:
            err.response.data.message ||
            "비밀번호 변경 실패. 다시 시도해주세요.",
        });
      } else {
        setAlertData({ message: "서버와 통신 중 오류가 발생했습니다." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ✅ 상단바 */}
      <div className="relative">
        <TopBar />
        {/* ✅ 로그아웃 버튼 */}
        <button
          onClick={confirmLogout}
          className="absolute top-3.5 right-2.5 z-40"
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
            className="mt-4 bg-primary text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            프로필 수정
          </button>
        </div>

        {/* ✅ 유저 정보 */}
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

        {/* ✅ 비밀번호 변경 버튼 */}
        <div
          onClick={() => setIsPasswordModalOpen(true)}
          className="w-full max-w-xl mt-6 cursor-pointer"
        >
          <hr className="border-gray-300 my-4" />
          <p className="text-right text-primary font-semibold py-3 hover:text-blue-700">
            비밀번호 변경
          </p>
        </div>
      </div>

      {/* ✅ 하단바 공간 확보 */}
      <div className="pb-16">
        <BottomBar />
      </div>

      {/* ✅ 비밀번호 변경 모달 */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold text-center mb-4">
              비밀번호 변경
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-3">
              {[
                {
                  label: "현재 비밀번호",
                  name: "currentPassword",
                  type: showCurrentPassword ? "text" : "password",
                  toggle: () => setShowCurrentPassword(!showCurrentPassword),
                },
                {
                  label: "새 비밀번호",
                  name: "newPassword",
                  type: showPassword ? "text" : "password",
                  toggle: () => setShowPassword(!showPassword),
                },
                {
                  label: "새 비밀번호 확인",
                  name: "confirmNewPassword",
                  type: showConfirmPassword ? "text" : "password",
                  toggle: () => setShowConfirmPassword(!showConfirmPassword),
                },
              ].map((field, index) => (
                <TextField
                  key={index}
                  type={field.type}
                  name={field.name}
                  label={field.label}
                  value={formData[field.name]}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={field.toggle} edge="end">
                          {field.type === "password" ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              ))}
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-white"
                >
                  변경
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ 모달 적용 */}
      {alertData && (
        <AlertModal {...alertData} onClose={() => setAlertData(null)} />
      )}
      {confirmData && (
        <ConfirmModal {...confirmData} onCancel={() => setConfirmData(null)} />
      )}

      {/* ✅ 로딩 화면 */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <BeatLoader size={15} color="white" />
        </div>
      )}
    </div>
  );
}
