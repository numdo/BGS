import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../stores/useUserStore";
import TopBar from "../../components/bar/TopBar";
import { updateUser, getUser } from "../../api/User";
import axiosInstance from "../../utils/axiosInstance";

export default function MyInfoEditPage() {
  const { me, setMe } = useUserStore();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState();
  const [formData, setFormData] = useState({
    nickname: me.nickname || "",
    birthDate: me.birthDate || "",
    height: me.height || "",
    weight: me.weight || "",
    introduction: me.introduction || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(formData); // ✅ 서버에 업데이트 요청
      const updatedUser = await getUser(); // ✅ 최신 데이터 가져오기
      setMe(updatedUser); // ✅ Zustand 상태 업데이트
      alert("회원정보 수정 성공했습니다");
      navigate(-1);
    } catch (error) {
      console.error("❌ 회원정보 수정 실패:", error);
      alert("회원정보 수정 실패했습니다.");
    }
  };

  const handleImageChange = async (e) => {
    const selectedFile = e.target.files[0];
    const maxAllowedSize = 1 * 1024 * 1024;
    if (selectedFile.size > maxAllowedSize) {
      alert(`파일이 너무 큽니다: ${selectedFile.name}`);
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ TopBar & 저장 버튼 배치 */}
      <div className="relative">
        <TopBar />
        <button
          onClick={handleSubmit}
          className="absolute top-3 right-4 text-primary font-semibold text-lg"
        >
          저장
        </button>
      </div>

      <div className="max-w-2xl mx-auto p-4">
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
              src={previewUrl || me.profileImageUrl}
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  닉네임
                </label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  placeholder="닉네임을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  생년월일
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  키 (cm)
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="키를 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  몸무게 (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="몸무게를 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  자기소개
                </label>
                <textarea
                  name="introduction"
                  value={formData.introduction}
                  onChange={handleChange}
                  placeholder="자기소개를 입력하세요"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </form>

        {/* ✅ 비밀번호 변경 버튼 (텍스트 클릭 가능) */}
        <div
          onClick={() => navigate("/change-password")}
          className="w-full max-w-xl mt-6 cursor-pointer"
        >
          <hr className="border-gray-300 my-4" /> {/* 상단 구분선 */}
          <p className="text-right text-blue-600 font-semibold py-3 hover:text-blue-700">
            비밀번호 변경
          </p>
        </div>
      </div>
    </div>
  );
}
