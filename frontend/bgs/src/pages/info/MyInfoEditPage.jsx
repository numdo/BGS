import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../stores/useUserStore";
import TopBar from "../../components/bar/TopBar";
import { updateUser, getUser, checkNickname, deleteUser } from "../../api/User";
import axiosInstance from "../../utils/axiosInstance";
import BeatLoader from "../../components/common/LoadingSpinner";
import AlertModal from "../../components/common/AlertModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import myinfo from "../../assets/icons/myinfo.png";

export default function MyInfoEditPage() {
  const { me, setMe } = useUserStore();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [nicknameValid, setNicknameValid] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // ✅ 탈퇴 진행 상태 추가

  // ✅ 모달 상태
  const [alertData, setAlertData] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  const [formData, setFormData] = useState({
    nickname: me.nickname || "",
    height: me.height || "",
    weight: me.weight || "",
    introduction: me.introduction || "",
  });

  useEffect(() => {
    getMyInfo();
  }, []);

  const getMyInfo = async () => {
    const userData = await getUser();
    setFormData(userData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "nickname") {
      setNicknameChecked(false);
      setNicknameValid(null);
    }
  };

  const handleCheckNickname = async () => {
    if (!formData.nickname.trim()) {
      setAlertData({ message: "닉네임을 입력해주세요." });
      return;
    }

    setIsChecking(true);
    try {
      const response = await checkNickname(formData.nickname); // ✅ API 호출
      const isAvailable = response?.available; // ✅ `available` 값 추출

      if (isAvailable) {
        setNicknameValid(true);
        setNicknameChecked(true);
        setAlertData({
          message: "닉네임을 사용할 수 있습니다.",
          success: true,
        });
      } else {
        setNicknameValid(false);
        setNicknameChecked(false);
        setFormData((prev) => ({ ...prev, nickname: me.nickname })); // ✅ 원래 닉네임 복구
        setAlertData({ message: "이미 사용 중인 닉네임입니다." });
      }
    } catch (error) {
      console.error("닉네임 중복 확인 실패:", error);
      setAlertData({ message: "닉네임 중복 확인 중 오류가 발생했습니다." });
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let updateData = { ...formData };
      updateData.birthDate = me.birthDate;

      if (!nicknameChecked || !nicknameValid) {
        updateData.nickname = me.nickname;
      }

      await updateUser(updateData);
      const updatedUser = await getUser();
      const { userId, introduction, nickname, role, profileImageUrl } =
        updatedUser;
      const userData = {
        userId,
        introduction,
        nickname,
        role,
        profileImageUrl,
      };
      setMe(userData);
      setAlertData({
        message: "회원정보가 성공적으로 수정되었습니다.",
        success: true,
      });
      navigate(-1);
    } catch (error) {
      console.error("❌ 회원정보 수정 실패:", error);

      if (error.response) {
        if (error.response.status === 500) {
          setAlertData({
            message: "몸무게와 키는 4자리 이상 입력할 수 없습니다.",
          });
        } else if (error.response.status === 409) {
          setAlertData({
            message: "닉네임이 중복되었습니다. 다시 중복 확인을 해주세요.",
            onClose: () => setNicknameChecked(false),
          });
        } else {
          setAlertData({ message: "회원정보 수정 실패했습니다." });
        }
      } else {
        setAlertData({ message: "알 수 없는 오류가 발생했습니다." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const selectedFile = e.target.files[0];
    const maxAllowedSize = 1 * 1024 * 1024;
    if (selectedFile.size > maxAllowedSize) {
      setAlertData({ message: `파일이 너무 큽니다: ${selectedFile.name}` });
      return;
    }
    const formData = new FormData();
    formData.append("profileImage", selectedFile);
    await axiosInstance.patch("/users/me/profile-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const newPreview = URL.createObjectURL(selectedFile);
    setPreviewUrl(newPreview);

    // me 변경
    const updatedUser = await getUser();
    const { userId, introduction, nickname, role, profileImageUrl } =
      updatedUser;
    const userData = {
      userId,
      introduction,
      nickname,
      role,
      profileImageUrl,
    };
    setMe(userData);
  };

  // ✅ 회원 탈퇴 처리 함수 (모달 사용)
  const handleDeleteUser = () => {
    if (isDeleting) return; // ✅ 중복 클릭 방지

    setConfirmData({
      message: "정말로 탈퇴하시겠습니까?",
      confirmText: "탈퇴",
      cancelText: "취소",
      confirmColor: "bg-red-500",
      textColor: "text-white",
      onConfirm: async () => {
        setConfirmData(null); // ✅ 탈퇴 버튼을 누르면 모달 즉시 닫기
        setIsDeleting(true); // ✅ 로딩 시작

        try {
          await deleteUser();

          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");

          // ✅ 1초 후에 모달 표시 (로딩 효과 강화)
          setTimeout(() => {
            setIsDeleting(false); // ✅ 로딩 종료
            setAlertData({
              message: "회원 탈퇴가 완료되었습니다.",
              success: true,
              navigateTo: "/login", // ✅ 확인 누르면 로그인 페이지 이동
            });
          }, 1000);
        } catch (error) {
          console.error("회원 탈퇴 실패:", error);
          setIsDeleting(false); // ✅ 실패 시 다시 탈퇴 가능하도록 변경
          setAlertData({ message: "회원 탈퇴 중 오류가 발생했습니다." });
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="relative z-30">
        <TopBar />
      </div>
      <div className="max-w-xl mx-auto p-4">
        <h1 className="text-center text-xl text-gray-600 font-bold mb-6">
          프로필 편집
        </h1>

        <div className="flex justify-center mb-8">
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              ref={fileInputRef}
              style={{ display: "none" }}
            />
            <img
              src={previewUrl || me.profileImageUrl || myinfo}
              alt="프로필 이미지"
              className="w-36 h-36 rounded-full object-cover"
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-0 right-0 bg-white rounded-full px-3 py-1 text-sm border border-gray-300 hover:bg-gray-100"
            >
              변경
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                닉네임
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  placeholder="닉네임을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={12}
                />
                <button
                  type="button"
                  onClick={handleCheckNickname}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary flex items-center justify-center"
                  disabled={isChecking}
                >
                  {isChecking ? (
                    <BeatLoader size={10} color="white" />
                  ) : (
                    <span className="whitespace-nowrap">중복 체크</span>
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-500 ml-2 mt-1">
                - 닉네임은 최대 12글자까지 입력할 수 있습니다.
              </p>
              <p className="text-sm text-gray-500 ml-2 mt-1">
                - 중복체크를 하지 않을 경우 적용되지 않습니다.
              </p>
            </div>

            {["height", "weight"].map((field) => (
              <div key={field} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {field === "height" ? "키 (cm)" : "몸무게 (kg)"}
                </label>
                <input
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            ))}

            {/* ✅ 자기소개 (세로 3줄 가능하도록 확장) */}
            <label className="block text-sm font-medium text-gray-700">
              자기소개
            </label>
            <textarea
              name="introduction"
              value={formData.introduction}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="자기소개를 입력하세요"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="relative text-white w-full rounded-md p-2 text-base bg-primary text-center z-40"
          >
            저장
          </button>
        </form>

        <div className="w-full max-w-xl mt-6 flex flex-col items-end">
          {/* ✅ 회원 탈퇴 위에 선 추가 */}
          <hr className="border-gray-300 my-4 w-full" />
          {/* ✅ 회원 탈퇴 버튼 */}
          <button
            onClick={handleDeleteUser}
            className="text-red-600 font-semibold py-3 hover:text-blue-700 cursor-pointer bg-transparent border-none"
          >
            회원 탈퇴
          </button>
        </div>
      </div>

      {/* ✅ 모달 적용 */}
      {alertData && (
        <AlertModal {...alertData} onClose={() => setAlertData(null)} />
      )}
      {confirmData && (
        <ConfirmModal {...confirmData} onCancel={() => setConfirmData(null)} />
      )}

      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="text-center">
            <BeatLoader size={20} color="#5968eb" />
            <p className="text-white mt-4 text-lg">회원 탈퇴 중...</p>
          </div>
        </div>
      )}
    </div>
  );
}
