import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../../api/User";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { TextField, InputAdornment, Typography, Box } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import IconButton from "@mui/material/IconButton";
import BeatLoader from "../../components/common/LoadingSpinner";
import AlertModal from "../../components/common/AlertModal";
import logoImage from "../../assets/images/logo_image.png";
import nameImage from "../../assets/images/name.png";

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertData, setAlertData] = useState(null);

  // 비밀번호 표시 토글
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 비밀번호 유효성 검사
  const isPasswordValid = () => {
    return (
      formData.newPassword.length >= 8 &&
      formData.newPassword === formData.confirmNewPassword
    );
  };

  // 비밀번호 변경 요청
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordValid()) {
      setError("비밀번호는 8자 이상 이어어야 합니다.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmNewPassword,
      });

      setLoading(false); // 로딩 종료
      setAlertData({
        message: "비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.",
        success: true,
        navigateTo: "/login",
      });

      localStorage.removeItem("accessToken"); // 기존 토큰 삭제
    } catch (err) {
      setLoading(false);
      setError(err.response?.data || "비밀번호 변경 실패. 다시 시도해주세요.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white px-10 py-16">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-5 left-5 text-black font-medium p-2 rounded hover:bg-gray-100 flex items-center space-x-2"
      >
        <ArrowLeft size={20} />
      </button>

      {/* 페이지 상단: 로고 및 앱 이름 */}
      <div className="flex items-center justify-center space-x-8 mb-10">
        <img src={logoImage} alt="Logo" className="h-24" />
        <img src={nameImage} alt="App Name" className="h-12" />
      </div>

      {/* 제목 */}
      <Typography variant="h5" fontWeight="bold" color="textPrimary" mb={2}>
        비밀번호 변경
      </Typography>

      {/* 비밀번호 변경 입력 폼 */}
      <form className="space-y-4 w-full max-w-md" onSubmit={handleSubmit}>
        {/* 현재 비밀번호 */}
        <TextField
          type={showCurrentPassword ? "text" : "password"}
          name="currentPassword"
          label="현재 비밀번호"
          value={formData.currentPassword}
          onChange={handleChange}
          fullWidth
          required
          variant="outlined"
          InputProps={{
            sx: { pr: "26px" }, // ✅ 오른쪽 패딩 제거
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  edge="end"
                >
                  {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* 새 비밀번호 */}
        <TextField
          type={showPassword ? "text" : "password"}
          name="newPassword"
          label="새 비밀번호 (8자 이상)"
          value={formData.newPassword}
          onChange={handleChange}
          fullWidth
          required
          variant="outlined"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* 새 비밀번호 확인 */}
        <TextField
          type={showConfirmPassword ? "text" : "password"}
          name="confirmNewPassword"
          label="새 비밀번호 확인"
          value={formData.confirmNewPassword}
          onChange={handleChange}
          fullWidth
          required
          variant="outlined"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* 안내 문구 */}
        <Typography variant="body2" color="textSecondary" align="center">
          비밀번호는 8자 이상이어야 합니다.
        </Typography>

        {/* 오류 메시지 */}
        {error && (
          <Typography color="error" align="center">
            {error}
          </Typography>
        )}

        {/* 비밀번호 변경 버튼 */}
        <div className="flex justify-center w-full mt-4">
          <Box width="100%" maxWidth="400px">
            <button
              type="submit"
              className={`w-full h-[56px] rounded-lg text-base font-semibold transition ${
                isPasswordValid()
                  ? "bg-primary text-white"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
              disabled={!isPasswordValid() || loading}
            >
              {loading ? "변경 중..." : "비밀번호 변경"}
            </button>
          </Box>
        </div>
      </form>

      {/* ✅ 전체 화면 로딩 표시 */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <BeatLoader size={15} color="#5968eb" />
        </div>
      )}

      {/* ✅ 알림 모달 */}
      {alertData && (
        <AlertModal {...alertData} onClose={() => setAlertData(null)} />
      )}
    </div>
  );
};

export default ChangePasswordPage;
